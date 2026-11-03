import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass, ShaderPass, AfterimagePass, FilmPass, HorizontalBlurShader, VerticalBlurShader } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass, ShaderPass, AfterimagePass, FilmPass });


const GeometricDistortShader = {
    uniforms: {
        'tDiffuse':    { value: null },
        'uGeoMode':    { value: 0 },     // 0=off 1=kaleid 2=mirrorH 3=mirrorV 4=pixelate 5=fisheye 6=bulge 7=polar
        'uGeoAmount':  { value: 0.5 },   // generic strength / amount
        'uSegments':   { value: 6.0 },   // kaleidoscope segments (3–16)
        'uPixelSize':  { value: 8.0 },   // pixelate block size (2–64)
        'uResolution': { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform int   uGeoMode;
        uniform float uGeoAmount;
        uniform float uSegments;
        uniform float uPixelSize;
        uniform vec2  uResolution;
        varying vec2  vUv;

        #define PI  3.14159265358979
        #define PI2 6.28318530718

        void main() {
            if (uGeoMode == 0) { gl_FragColor = texture2D(tDiffuse, vUv); return; }

            vec2 uv = vUv;

            // ── 1. Kaleidoscope ───────────────────────────────────────────────
            if (uGeoMode == 1) {
                vec2 p = uv - 0.5;
                float r = length(p);
                float a = atan(p.y, p.x);
                float sliceAngle = PI2 / uSegments;
                a = mod(a, sliceAngle);
                if (a > sliceAngle * 0.5) a = sliceAngle - a; // mirror within slice
                uv = vec2(r * cos(a), r * sin(a)) + 0.5;
            }
            // ── 2. Mirror Horizontal ─────────────────────────────────────────
            else if (uGeoMode == 2) {
                uv.x = uv.x < 0.5 ? uv.x : 1.0 - uv.x;
            }
            // ── 3. Mirror Vertical ───────────────────────────────────────────
            else if (uGeoMode == 3) {
                uv.y = uv.y < 0.5 ? uv.y : 1.0 - uv.y;
            }
            // ── 4. Pixelate ───────────────────────────────────────────────────
            else if (uGeoMode == 4) {
                vec2 blockSize = vec2(uPixelSize) / uResolution;
                uv = floor(uv / blockSize) * blockSize + blockSize * 0.5;
            }
            // ── 5. Fisheye / Spherize ─────────────────────────────────────────
            else if (uGeoMode == 5) {
                vec2 p = uv * 2.0 - 1.0;
                float len = length(p);
                if (len < 1.0) {
                    float z = sqrt(1.0 - len * len * uGeoAmount);
                    float theta = atan(len / z) * (1.0 / PI);
                    uv = p * (theta / len) * 0.5 + 0.5;
                }
            }
            // ── 6. Bulge / Pinch ──────────────────────────────────────────────
            else if (uGeoMode == 6) {
                vec2 p = uv - 0.5;
                float dist = length(p);
                float factor = pow(dist, uGeoAmount > 0.5 ? 0.6 : 1.8);
                uv = normalize(p + 0.00001) * factor * 0.5 + 0.5;
            }
            // ── 7. Polar Coordinates ──────────────────────────────────────────
            else if (uGeoMode == 7) {
                float r = uv.y;
                float a = (uv.x - 0.5) * PI2;
                uv = vec2(r * cos(a), r * sin(a)) * 0.5 + 0.5;
            }

            gl_FragColor = texture2D(tDiffuse, clamp(uv, 0.001, 0.999));
        }
    `
};
// --- INJECTED SHADER CONSTANTS ---
const ColorGradeCompositeShader = {
    uniforms: {
        "tDiffuse":    { value: null },
        "bgColor":     { value: new THREE.Color(0x000000) },
        "uBrightness": { value: 0.0 },   // -0.5 → +0.5
        "uContrast":   { value: 1.0 },   // 0.0 → 3.0
        "uSaturation": { value: 1.0 },   // 0.0 → 3.0
        "uHueShift":   { value: 0.0 },   // 0.0 → 1.0 (full rotation)
        "uExposure":   { value: 1.0 },   // 0.1 → 4.0
        "uToneMap":    { value: 0 },     // 0=off 1=ACES 2=Reinhard 3=Filmic
        "uTintColor":  { value: new THREE.Color(0xffffff) },
        "uTintShadow": { value: new THREE.Color(0x000000) },
        "uTintAmt":    { value: 0.0 },   // 0.0 → 1.0
        "uInvert":     { value: 0.0 },   // 0=off 1=on
        "uSolarize":   { value: 0.0 },   // 0=off 0–1=threshold
        "uPosterize":  { value: 0.0 },   // 0=off 2–8=bands
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3  bgColor;
        uniform float uBrightness;
        uniform float uContrast;
        uniform float uSaturation;
        uniform float uHueShift;
        uniform float uExposure;
        uniform int   uToneMap;
        uniform vec3  uTintColor;
        uniform vec3  uTintShadow;
        uniform float uTintAmt;
        uniform float uInvert;
        uniform float uSolarize;
        uniform float uPosterize;
        varying vec2  vUv;

        // Hue rotation matrix (lossless, works on any colour)
        vec3 rotateHue(vec3 col, float h) {
            float ang = h * 6.28318530718;
            float c = cos(ang), s = sin(ang);
            float sq = 0.57735026919; // 1/sqrt(3)
            // Rodrigues rotation around grey axis (1,1,1)/sqrt(3)
            return col * c
                + cross(vec3(sq,sq,sq), col) * s
                + vec3(sq,sq,sq) * dot(vec3(sq,sq,sq), col) * (1.0 - c);
        }

        // Tone mapping
        vec3 acesToneMap(vec3 x){
            return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.);
        }
        vec3 reinhardToneMap(vec3 x){ return x/(x+1.); }
        vec3 filmicToneMap(vec3 x){
            vec3 X=max(vec3(0.),x-0.004);
            return (X*(6.2*X+0.5))/(X*(6.2*X+1.7)+0.06);
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);

            // 1. Background composite
            float bgAlpha = clamp(max(texel.r, max(texel.g, texel.b)), 0.0, 1.0);
            vec3 col = texel.rgb + bgColor * (1.0 - bgAlpha);

            // 2. Exposure
            col *= uExposure;

            // 3. Tone mapping
            if (uToneMap == 1) col = acesToneMap(col);
            else if (uToneMap == 2) col = reinhardToneMap(col);
            else if (uToneMap == 3) col = filmicToneMap(col);

            // 4. Brightness
            col = col + uBrightness;

            // 5. Contrast  (pivot at 0.5)
            col = (col - 0.5) * uContrast + 0.5;

            // 6. Saturation
            float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
            col = mix(vec3(lum), col, uSaturation);

            // 7. Hue shift
            if (uHueShift != 0.0) col = rotateHue(col, uHueShift);

            // 8. Duotone (shadow→highlight colour remap)
            if (uTintAmt > 0.0) {
                float lumDt = dot(col, vec3(0.2126, 0.7152, 0.0722));
                vec3 duotone = mix(uTintShadow, uTintColor, lumDt);
                col = mix(col, duotone, uTintAmt);
            }

            // 9. Solarize  (partial invert above threshold)
            if (uSolarize > 0.0) {
                float lumS = dot(col, vec3(0.2126, 0.7152, 0.0722));
                float mask = step(uSolarize, lumS);
                col = mix(col, 1.0 - col, mask);
            }

            // 10. Invert
            if (uInvert > 0.5) col = 1.0 - col;

            // 11. Posterize
            if (uPosterize >= 2.0) {
                float bands = uPosterize;
                col = floor(col * bands + 0.5) / bands;
            }

            gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
        }
    `
};

const LiquidMarbleShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0.0 },
        'strength': { value: 0.0 },
        'speed': { value: 0.5 },
        'scale': { value: 3.0 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float strength;
        uniform float speed;
        uniform float scale;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p){
            vec2 i=floor(p); vec2 f=fract(p);
            vec2 u=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
        }
        vec2 fbm2(vec2 p){
            float f=0.0; float a=0.5;
            for(int i=0;i<5;i++){ f+=a*noise(p); p*=2.0; a*=0.5; }
            return vec2(f, noise(p+vec2(3.7,1.3)));
        }
        void main(){
            if(strength==0.0){ gl_FragColor=texture2D(tDiffuse,vUv); return; }
            vec2 p = vUv * scale;
            float t = time * speed;
            // Domain warp — each layer warps the coordinate space of the next
            vec2 q = fbm2(p + t);
            vec2 r = fbm2(p + q + vec2(1.7+t*0.15, 9.2+t*0.05));
            vec2 warp = fbm2(p + r);
            vec2 sampledUv = clamp(vUv + (warp - 0.5) * strength * 0.4, 0.001, 0.999);
            gl_FragColor = texture2D(tDiffuse, sampledUv);
        }
    `
};

const TwirlShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'angle': { value: 0.0 },
        'radius': { value: 0.5 },
        'center': { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float angle;
        uniform float radius;
        uniform vec2 center;
        varying vec2 vUv;
        void main(){
            vec2 delta = vUv - center;
            float dist = length(delta);
            float twirlAngle = angle * max(0.0, (radius - dist) / radius);
            float c = cos(twirlAngle), s = sin(twirlAngle);
            vec2 rotated = vec2(c*delta.x - s*delta.y, s*delta.x + c*delta.y);
            gl_FragColor = texture2D(tDiffuse, clamp(center + rotated, 0.001, 0.999));
        }
    `
};

const WaveWarpShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0.0 },
        'freqX': { value: 10.0 },
        'freqY': { value: 10.0 },
        'amplitude': { value: 0.0 },
        'speed': { value: 1.0 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float freqX;
        uniform float freqY;
        uniform float amplitude;
        uniform float speed;
        varying vec2 vUv;
        void main(){
            if(amplitude==0.0){ gl_FragColor=texture2D(tDiffuse,vUv); return; }
            float t = time * speed;
            vec2 displaced = vUv + vec2(
                sin(vUv.y * freqX + t) * amplitude,
                cos(vUv.x * freqY + t) * amplitude
            );
            gl_FragColor = texture2D(tDiffuse, clamp(displaced, 0.001, 0.999));
        }
    `
};

const FluidChromaShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0.0 },
        'strength': { value: 0.0 },
        'dispersion': { value: 0.02 },
        'speed': { value: 0.5 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float strength;
        uniform float dispersion;
        uniform float speed;
        varying vec2 vUv;
        
        void main() {
            if(strength == 0.0) { gl_FragColor = texture2D(tDiffuse, vUv); return; }
            
            float t = time * speed;
            vec2 p = vUv - 0.5;
            
            // Large scale, smooth, organic flow using trig functions instead of high-frequency noise
            float x1 = sin(p.y * 3.1 + t * 0.7) * cos(p.x * 2.1 + t * 0.9);
            float y1 = cos(p.x * 3.4 - t * 0.6) * sin(p.y * 2.3 - t * 0.8);
            
            float x2 = sin(p.y * 5.2 - t * 1.2 + x1) * cos(p.x * 4.1 + t * 1.1 + y1);
            float y2 = cos(p.x * 5.5 + t * 1.3 - x1) * sin(p.y * 4.3 - t * 1.0 - y1);
            
            // Smooth directional vector
            vec2 dir = vec2(x2, y2) * strength * 0.2;
            
            // Heavy chromatic aberration on the fluid edges
            float rCol = texture2D(tDiffuse, clamp(vUv + dir * (1.0 + dispersion * 2.0), 0.001, 0.999)).r;
            float gCol = texture2D(tDiffuse, clamp(vUv + dir, 0.001, 0.999)).g;
            float bCol = texture2D(tDiffuse, clamp(vUv + dir * (1.0 - dispersion * 2.0), 0.001, 0.999)).b;
            
            // Add a subtle iridescent sheen based on the flow derivative
            float sheen = dot(dir, vec2(0.5)) * 2.0;
            vec3 iridescence = vec3(
                0.5 + 0.5 * sin(sheen * 10.0 + 0.0),
                0.5 + 0.5 * sin(sheen * 10.0 + 2.0),
                0.5 + 0.5 * sin(sheen * 10.0 + 4.0)
            ) * 0.15 * strength;

            gl_FragColor = vec4(vec3(rCol, gCol, bCol) + iridescence, 1.0);
        }
    `
};

const PixelMeltShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0.0 },
        'amount': { value: 0.0 },
        'threshold': { value: 0.5 },
        'angle': { value: 0.0 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float amount;
        uniform float threshold;
        uniform float angle;
        varying vec2 vUv;
        
        float hash(float n) { return fract(sin(n)*43758.5453); }
        float noise(vec2 p) {
            vec2 ip = floor(p); vec2 u = fract(p); u = u*u*(3.0-2.0*u);
            float res = mix(
                mix(hash(ip.x+ip.y*57.0), hash(ip.x+1.0+ip.y*57.0), u.x),
                mix(hash(ip.x+(ip.y+1.0)*57.0), hash(ip.x+1.0+(ip.y+1.0)*57.0), u.x), u.y);
            return res;
        }

        void main() {
            if(amount == 0.0) { gl_FragColor = texture2D(tDiffuse, vUv); return; }
            
            float angRad = angle * 3.14159265 / 180.0;
            vec2 dir = vec2(cos(angRad), sin(angRad));
            
            vec2 perp = vec2(-dir.y, dir.x);
            float lineCoord = dot(vUv, perp);
            
            float n = noise(vec2(lineCoord * 100.0, time * 0.5));
            float n2 = noise(vec2(lineCoord * 50.0, time * 0.2));
            
            float displacement = 0.0;
            if (n > threshold) {
                displacement = (n - threshold) * amount * 0.5 + n2 * amount * 0.5;
            }
            
            vec2 uvOffset = vUv - dir * displacement;
            vec4 col = texture2D(tDiffuse, clamp(uvOffset, 0.001, 0.999));
            gl_FragColor = col;
        }
    `
};

const CrystalPrismShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0.0 },
        'facets': { value: 10.0 },
        'refraction': { value: 0.05 },
        'dispersion': { value: 0.02 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float facets;
        uniform float refraction;
        uniform float dispersion;
        varying vec2 vUv;
        
        vec2 hash2(vec2 p) {
            p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
            return fract(sin(p)*43758.5453);
        }
        
        void main() {
            if(refraction <= 0.0) { gl_FragColor = texture2D(tDiffuse, vUv); return; }
            
            vec2 p = vUv * facets;
            vec2 n = floor(p);
            vec2 f = fract(p);
            
            vec2 m_point;
            float m_dist = 8.0;
            
            for(int j=-1; j<=1; j++)
            for(int i=-1; i<=1; i++) {
                vec2 g = vec2(float(i),float(j));
                vec2 o = hash2(n + g);
                o = 0.5 + 0.5*sin(time * 0.2 + 6.2831*o);
                vec2 r = g + o - f;
                float d = dot(r,r);
                if(d < m_dist) {
                    m_dist = d;
                    m_point = r;
                }
            }
            
            vec2 edgeDist = min(vUv, 1.0 - vUv);
            float edgeFade = smoothstep(0.0, 0.05, min(edgeDist.x, edgeDist.y));
            vec2 warp = m_point * refraction * edgeFade;
            
            float rCol = texture2D(tDiffuse, clamp(vUv + warp * (1.0 + dispersion), 0.001, 0.999)).r;
            float gCol = texture2D(tDiffuse, clamp(vUv + warp, 0.001, 0.999)).g;
            float bCol = texture2D(tDiffuse, clamp(vUv + warp * (1.0 - dispersion), 0.001, 0.999)).b;
            
            float highlight = smoothstep(0.2, 0.0, length(m_point)) * 0.15 * clamp(refraction * 10.0, 0.0, 1.0);
            
            gl_FragColor = vec4(rCol + highlight, gCol + highlight, bCol + highlight, 1.0);
        }
    `
};

const CinematicArtifactShader = {
    uniforms: {
        'tDiffuse':       { value: null },
        'uHalation':      { value: 0.0 },  // 0.0 → 1.0
        'uHalationColor': { value: new THREE.Color(0xff4400) },
        'uScanlines':     { value: 0.0 },  // 0.0 → 1.0
        'uScanDensity':   { value: 200.0 },// lines per screen (80–400)
        'uScanSoftness':  { value: 0.5 },  // edge softness
        'uResolution':    { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uHalation;
        uniform vec3  uHalationColor;
        uniform float uScanlines;
        uniform float uScanDensity;
        uniform float uScanSoftness;
        uniform vec2  uResolution;
        varying vec2 vUv;

        // Simple box blur (5-tap horizontal) for halation glow
        vec3 boxBlur(vec2 uv, float rad) {
            vec2 px = vec2(rad) / uResolution;
            vec3 c = texture2D(tDiffuse, uv).rgb;
            c += texture2D(tDiffuse, uv + vec2(px.x, 0.)).rgb;
            c += texture2D(tDiffuse, uv - vec2(px.x, 0.)).rgb;
            c += texture2D(tDiffuse, uv + vec2(0., px.y)).rgb;
            c += texture2D(tDiffuse, uv - vec2(0., px.y)).rgb;
            return c / 5.0;
        }

        void main() {
            if (uHalation == 0.0 && uScanlines == 0.0) {
                gl_FragColor = texture2D(tDiffuse, vUv);
                return;
            }
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 col = texel.rgb;

            // Halation: warm glow around bright edges (film emulation)
            if (uHalation > 0.0) {
                vec3 blurred = boxBlur(vUv, 8.0);
                float brightness = dot(blurred, vec3(0.2126, 0.7152, 0.0722));
                float haloPow = pow(max(0.0, brightness - 0.4), 1.5);
                vec3 haloColor = uHalationColor * haloPow * uHalation * 2.0;
                // Additive blend — mimics light leaking through film layers
                col += haloColor * (1.0 - col); // dodge-style to avoid blowout
            }

            // CRT Scanlines: horizontal dark lines across the screen
            if (uScanlines > 0.0) {
                float lineY = vUv.y * uScanDensity;
                float wave = sin(lineY * 3.14159265) * 0.5 + 0.5;
                float line = smoothstep(uScanSoftness, 1.0 - uScanSoftness, wave);
                float darkness = 1.0 - (1.0 - line) * uScanlines * 0.7;
                col *= darkness;
            }

            gl_FragColor = vec4(col, texel.a);
        }
    `
};

const LensSimulationShader = {
    uniforms: {
        'tDiffuse':      { value: null },
        'uTime':         { value: 0.0 },
        'uLensDist':     { value: 0.0 },  // -1.0 → 1.0 (neg=barrel, pos=pincushion)
        'uShake':        { value: 0.0 },  // 0.0 → 1.0
        'uShakeSpeed':   { value: 3.0 },  // shake frequency
        'uStreaks':       { value: 0.0 }, // 0.0 → 1.0 anamorphic horizontal streaks
        'uStreakColor':  { value: new THREE.Color(0x88aaff) },
        'uResolution':   { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uLensDist;
        uniform float uShake;
        uniform float uShakeSpeed;
        uniform float uStreaks;
        uniform vec3  uStreakColor;
        uniform vec2  uResolution;
        varying vec2  vUv;

        // Pseudo-random for shake
        float rand(float n){ return fract(sin(n) * 43758.5453); }

        void main() {
            if (uLensDist == 0.0 && uShake == 0.0 && uStreaks == 0.0) {
                gl_FragColor = texture2D(tDiffuse, vUv);
                return;
            }
            vec2 uv = vUv;

            // ── Camera Shake ─────────────────────────────────────────────────
            if (uShake > 0.0) {
                float t = floor(uTime * uShakeSpeed);
                vec2 shakeOffset = vec2(
                    (rand(t) - 0.5) * 2.0,
                    (rand(t + 1.7) - 0.5) * 2.0
                ) * uShake * 0.015;
                uv += shakeOffset;
            }

            // ── Lens Distortion (barrel k1 radial) ────────────────────────
            if (uLensDist != 0.0) {
                vec2 p = uv * 2.0 - 1.0;
                float r2 = dot(p, p);
                float distortion = 1.0 + uLensDist * r2;
                p *= distortion;
                uv = p * 0.5 + 0.5;
            }

            vec4 col = texture2D(tDiffuse, clamp(uv, 0.001, 0.999));

            // ── Anamorphic Streaks (horizontal lens flare lines) ──────────
            if (uStreaks > 0.0) {
                float brightness = dot(col.rgb, vec3(0.2126, 0.7152, 0.0722));
                float threshold = 0.6;
                float streakIntensity = max(0.0, brightness - threshold) * uStreaks * 3.0;

                // Sample horizontally to create streak
                vec3 streak = vec3(0.0);
                float total = 0.0;
                float maxWidth = 0.3 * uStreaks;
                for (int i = -8; i <= 8; i++) {
                    float offset = float(i) * maxWidth / 8.0;
                    float weight = exp(-float(i*i) * 0.08); // Gaussian falloff along streak
                    vec2 sampleUv = vec2(clamp(uv.x + offset, 0.001, 0.999), uv.y);
                    vec3 s = texture2D(tDiffuse, sampleUv).rgb;
                    float sBright = dot(s, vec3(0.2126, 0.7152, 0.0722));
                    streak += s * weight * max(0.0, sBright - threshold);
                    total += weight;
                }
                streak = (streak / total) * uStreakColor;
                col.rgb += streak * uStreaks * 1.5;
            }

            gl_FragColor = col;
        }
    `
};

const LiquidGlassShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'time': { value: 0.0 },
        'amount': { value: 0.0 },
        'type': { value: 0 },
        'uGlassScale': { value: 1.0 },
        'uGlassDistortion': { value: 1.0 },
        'uEdgeHighlight': { value: 1.0 },
        'uChromatic': { value: 1.0 },
        'uResolution': { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float amount;
        uniform int type;
        uniform float uGlassScale;
        uniform float uGlassDistortion;
        uniform float uEdgeHighlight;
        uniform float uChromatic;
        uniform vec2 uResolution;
        varying vec2 vUv;

        #define PI 3.14159265359

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

        float smoothNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f*f*(3.0-2.0*f);
            return mix(mix(hash(i+vec2(0,0)), hash(i+vec2(1,0)), u.x),
                       mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
        }

        float fbm(vec2 p) {
            float v = 0.0; float a = 0.5;
            for(int i=0; i<3; i++) { v += a * smoothNoise(p); p *= 2.0; a *= 0.5; }
            return v;
        }

        // Hexagon grid function
        vec4 hexCoords(vec2 uv) {
            vec2 r = vec2(1.0, 1.7320508);
            vec2 h = r * 0.5;
            vec2 a = mod(uv, r) - h;
            vec2 b = mod(uv - h, r) - h;
            vec2 gv = dot(a, a) < dot(b, b) ? a : b;
            vec2 id = uv - gv;
            return vec4(gv.x, gv.y, id.x, id.y);
        }

        vec4 sampleWithChromatic(vec2 uv, vec2 dir, float dist, vec3 baseHighlight) {
            float ca = uChromatic * amount * 0.05 * uGlassDistortion;
            if (ca <= 0.001) {
                vec4 col = texture2D(tDiffuse, clamp(uv + dir * dist, 0.001, 0.999));
                col.rgb += baseHighlight * uEdgeHighlight;
                return col;
            }
            vec2 rOffset = dir * (dist + ca);
            vec2 gOffset = dir * dist;
            vec2 bOffset = dir * (dist - ca);
            
            float r = texture2D(tDiffuse, clamp(uv + rOffset, 0.001, 0.999)).r;
            float g = texture2D(tDiffuse, clamp(uv + gOffset, 0.001, 0.999)).g;
            float b = texture2D(tDiffuse, clamp(uv + bOffset, 0.001, 0.999)).b;
            
            return vec4(r + baseHighlight.r * uEdgeHighlight, 
                        g + baseHighlight.g * uEdgeHighlight, 
                        b + baseHighlight.b * uEdgeHighlight, 1.0);
        }

        void main() {
            if (amount == 0.0) { gl_FragColor = texture2D(tDiffuse, vUv); return; }

            vec2 uv = vUv;
            vec2 sampleUv = uv;
            vec3 highlight = vec3(0.0);
            vec2 dir = vec2(0.0);
            float dist = 0.0;

            if (type == 0) { // ── Fluted ──────────────────────────────────────
                float strips = max(1.0, 30.0 * uGlassScale);
                float warpX = uv.x + sin(uv.x * 10.0 + time * 0.2) * 0.02;
                float phase = warpX * strips;
                float localX = fract(phase);
                
                dir = vec2(1.0, 0.0);
                dist = (localX - 0.5) * 0.1 * amount * uGlassDistortion;
                
                float edge = pow(abs(localX - 0.5) * 2.0, 8.0);
                highlight = vec3(edge * 0.5 * amount);
            }
            else if (type == 1) { // ── Frosted ──────────────────────────────────
                float scale = max(0.1, 4.0 * uGlassScale);
                vec2 n1 = vec2(
                    fbm(uv * scale + vec2(time * 0.1, 0.0)),
                    fbm(uv * scale + vec2(0.0, time * 0.1))
                );
                dir = (n1 - 0.5);
                dist = amount * 0.12 * uGlassDistortion;
            }
            else if (type == 2) { // ── Diamond Cut (NEW) ────────────────────────
                vec2 p = uv * max(1.0, 20.0 * uGlassScale);
                p.y += time * 0.5;
                
                vec2 p1 = mat2(0.866, -0.5, 0.866, 0.5) * p;
                vec2 f = fract(p1);
                vec2 i = floor(p1);
                
                float tri = step(f.x, f.y);
                vec2 center = i + vec2(0.5) + (tri == 1.0 ? vec2(-0.1, 0.1) : vec2(0.1, -0.1));
                
                vec2 facetNormal = normalize(p1 - center);
                dir = mat2(0.866, 0.5, -0.866, 0.5) * facetNormal;
                
                dist = amount * 0.08 * uGlassDistortion;
                
                float edgeX = min(f.x, 1.0 - f.x);
                float edgeY = min(f.y, 1.0 - f.y);
                float edgeDiag = abs(f.x - f.y);
                float edge = min(min(edgeX, edgeY), edgeDiag);
                
                float glint = pow(1.0 - smoothstep(0.0, 0.15, edge), 4.0);
                highlight = vec3(glint * 0.6 * amount);
            }
            else if (type == 3) { // ── Hexagonal Facets (NEW) ───────────────────
                vec2 p = (uv - 0.5) * (uResolution.x/uResolution.y);
                p *= max(1.0, 15.0 * uGlassScale);
                p.y += time * 0.2;
                
                vec4 hc = hexCoords(p);
                
                float angle = hash(hc.zw) * PI * 2.0;
                vec2 tilt = vec2(cos(angle), sin(angle));
                
                dir = tilt;
                dist = amount * 0.05 * uGlassDistortion;
                
                float hexDist = max(abs(hc.y), dot(abs(hc.xy), vec2(0.866025, 0.5)));
                float edge = smoothstep(0.42, 0.5, hexDist);
                highlight = vec3(edge * 0.5 * amount);
            }
            else if (type == 4) { // ── Prism / Spectrum ──────────────────────────
                float sep = amount * 0.04 * max(0.1, uGlassScale) * uGlassDistortion;
                vec2 rOff = vec2( sep,       sep * 0.5);
                vec2 gOff = vec2( 0.0,       0.0      );
                vec2 bOff = vec2(-sep,      -sep * 0.5);

                float angle = time * 0.15;
                float ca = cos(angle), sa = sin(angle);
                mat2 rot = mat2(ca, -sa, sa, ca);
                rOff = rot * rOff;
                bOff = rot * bOff;

                float r = texture2D(tDiffuse, clamp(uv + rOff, 0.001, 0.999)).r;
                float g = texture2D(tDiffuse, clamp(uv + gOff, 0.001, 0.999)).g;
                float b = texture2D(tDiffuse, clamp(uv + bOff, 0.001, 0.999)).b;

                float hue = fract(uv.x + uv.y * 0.5 + time * 0.05);
                vec3 rainbow;
                float h6 = hue * 6.0;
                float fi = floor(h6);
                float ff = h6 - fi;
                if      (fi < 1.0) rainbow = vec3(1.0, ff,  0.0);
                else if (fi < 2.0) rainbow = vec3(1.0-ff, 1.0, 0.0);
                else if (fi < 3.0) rainbow = vec3(0.0, 1.0, ff);
                else if (fi < 4.0) rainbow = vec3(0.0, 1.0-ff, 1.0);
                else if (fi < 5.0) rainbow = vec3(ff, 0.0, 1.0);
                else               rainbow = vec3(1.0, 0.0, 1.0-ff);
                
                rainbow *= 0.3 * amount * uEdgeHighlight; 

                gl_FragColor = vec4(vec3(r, g, b) + rainbow, 1.0);
                return;
            }
            else if (type == 5) { // ── Condensation (NEW) ───────────────────────
                vec2 p = uv * max(1.0, 8.0 * uGlassScale);
                p.x *= (uResolution.x / uResolution.y);
                
                vec2 gv = fract(p) - 0.5;
                vec2 id = floor(p);
                
                float n = hash(id);
                float t = time * 0.5 + n * 100.0;
                float dropSize = mix(0.1, 0.3, hash(id + 13.5));
                
                gv.y += sin(t) * 0.2 * step(0.8, hash(id + 7.2)); 
                
                float d = length(gv * vec2(1.0, 0.8));
                
                if (d < dropSize) {
                    vec3 normal = normalize(vec3(gv.x, gv.y, dropSize - d));
                    dir = normal.xy;
                    dist = amount * 0.15 * uGlassDistortion;
                    
                    float spec = pow(max(0.0, dot(normal, normalize(vec3(-1.0, 1.0, 1.0)))), 16.0);
                    highlight = vec3(spec * uEdgeHighlight * amount);
                } else {
                    float scale = 10.0;
                    vec2 n1 = vec2(fbm(uv * scale), fbm(uv * scale + 1.2));
                    dir = (n1 - 0.5);
                    dist = amount * 0.02;
                }
            }

            gl_FragColor = sampleWithChromatic(uv, dir, dist, highlight);
        }
    `
};



const RadialBlurShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "strength": { value: 0 },
        "center": { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float strength;
        uniform vec2 center;
        varying vec2 vUv;
        void main() {
            if (strength <= 0.0) {
                gl_FragColor = texture2D(tDiffuse, vUv);
                return;
            }
            vec4 color = vec4(0.0);
            vec2 dir = center - vUv;
            float fi = 0.0;
            for (int i = 0; i < 12; i++) {
                float scale = 1.0 - strength * (fi / 11.0) * 0.1;
                vec2 sampleUv = center - dir * scale;
                vec4 colorSample = texture2D(tDiffuse, sampleUv);
                color += colorSample;
                fi += 1.0;
            }
            gl_FragColor = color / 12.0;
        }
    `
};

const ParticleSwarm = () => {
  const meshRef = useRef();
  const count = 20000;
  const speedMult = 1;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; // Alias for user code compatibility
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, []);

  // Material & Geom
  const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
    uniforms: {
        texturePosition: { value: null },
        gpgpuEnabled: { value: 1.0 }
    },
    vertexShader: `
        attribute vec2 reference;
        uniform sampler2D texturePosition;
        uniform float gpgpuEnabled;
        varying vec3 vNormal;
        varying vec3 vColor;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vColor = instanceColor;
            mat4 m = instanceMatrix;
            if (gpgpuEnabled > 0.5) {
                m[3] = vec4(0.0, 0.0, 0.0, 1.0);
            }
            vec4 localPos = m * vec4(position, 1.0);
            if (gpgpuEnabled > 0.5) {
                localPos.xyz += texture2D(texturePosition, reference).xyz;
            }
            gl_Position = projectionMatrix * modelViewMatrix * localPos;
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vColor;
        void main() {
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            float metallic = dot(vNormal, viewDir) * 0.5 + 0.5;
            metallic = pow(metallic, 3.0);
            vec3 col = mix(vec3(0.1), vColor, 0.5) * metallic + vec3(0.2); 
            gl_FragColor = vec4(col, 1.0);
        }
    `
});
      if (mat.uniforms && mat.uniforms.gpgpuEnabled) {
          mat.uniforms.gpgpuEnabled.value = 0.0;
      }
      return mat;
  }, []);
  const geometry = useMemo(() => {
      const geo = new THREE.SphereGeometry(0.3, 16, 16).clone();
      const W = Math.ceil(Math.sqrt(count));
      const H = W;
      const references = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
          references[i * 2] = ((i % W) + 0.5) / W;
          references[i * 2 + 1] = (Math.floor(i / W) + 0.5) / H;
      }
      geo.setAttribute('reference', new THREE.InstancedBufferAttribute(references, 2));
      return geo;
  }, []);

  const PARAMS = useMemo(() => ({"voice":0,"demo":1,"size":55,"tilt":0.35,"warm":0}), []);
  const addControl = (id, l, min, max, val) => {
      return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };
  const setInfo = () => {};
  const annotate = () => {};
  const setPhysics = () => {};
  const setEffects = () => {};

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    const THREE_LIB = THREE;

    if(material.uniforms && material.uniforms.uTime) {
         material.uniforms.uTime.value = time;
    }

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3();
    state.raycaster.setFromCamera(state.pointer, state.camera);
    state.raycaster.ray.intersectPlane(plane, mouse3D);
    const MOUSE_MODE = 'none';
    const MOUSE_INFLUENCE = 2.5;

    for (let i = 0; i < count; i++) {
        // USER CODE START
        const voice = addControl("voice", "Voice Level (mic)", 0, 1, 0.0);
        const demo = addControl("demo", "Auto Speech Demo", 0, 1, 1.0);
        const size = addControl("size", "HUD Size", 20, 120, 55);
        const tilt = addControl("tilt", "Holo Tilt", 0, 1.2, 0.35);
        const warm = addControl("warm", "Gold Accent", 0, 1, 0.0);
        
        const TAU = 6.283185307;
        const R = size;
        const gate = Math.min(1, Math.max(0, (Math.sin(time * 0.6) + 0.3) * 2));
        const syl = Math.pow(0.5 + 0.5 * Math.sin(time * 5.3), 1.5) * (0.6 + 0.4 * Math.sin(time * 2.1 + 1.0));
        const level = Math.min(1, Math.max(voice, demo * gate * syl * 1.4));
        
        const hs = Math.sin(i * 12.9898) * 43758.5453;
        const h = hs - Math.floor(hs);
        const hs2 = Math.sin(i * 78.233 + 1.7) * 12543.1234;
        const h2 = hs2 - Math.floor(hs2);
        
        const tt = i / count;
        let x = 0;
        let y = 0;
        let z = 0;
        let hue = 0.53;
        let sat = 0.9;
        let lit = 0.5;
        
        if (tt < 0.10) {
          const u = tt / 0.10;
          const ph = Math.acos(1 - 2 * u);
          const th = i * 2.39996;
          const cr = R * 0.17 * (0.35 + 0.65 * h) * (1 + level * 0.6 + 0.08 * Math.sin(time * 3 + h * 6));
          x = cr * Math.sin(ph) * Math.cos(th);
          y = cr * Math.cos(ph);
          z = cr * Math.sin(ph) * Math.sin(th);
          hue = 0.52;
          sat = Math.max(0.1, 0.55 - level * 0.35);
          lit = Math.min(0.92, 0.6 + 0.25 * h + level * 0.2);
        } else if (tt < 0.55) {
          const k = (tt - 0.10) / 0.45;
          const kn = k * 5;
          const n = Math.floor(kn);
          const wn = kn - n;
          const segs = 6 + n * 4;
          const sc = wn * segs;
          const cell = Math.floor(sc);
          const fr = sc - cell;
          const dir = 1 - 2 * (n % 2);
          const a = (cell + fr * 0.6) * TAU / segs + time * (0.25 + 0.12 * n) * dir * (1 + level * 2);
          const rad = R * (0.45 + n * 0.27) * (1 + level * 0.04 * (n + 1) * Math.sin(time * 6 - n * 1.3)) + (h - 0.5) * R * 0.015;
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = (n - 2) * R * 0.07 + (h2 - 0.5) * R * 0.01;
          hue = 0.54 - n * 0.012;
          sat = 0.9;
          lit = 0.38 + 0.15 * Math.sin(a * 2 - time * 3) + level * 0.2 + fr * 0.05;
        } else if (tt < 0.70) {
          const k = (tt - 0.55) / 0.15;
          const km = k * 72;
          const m = Math.floor(km);
          const al = km - m;
          const major = (m % 6 === 0) ? 1 : 0;
          const pulse = Math.sin(m * 0.5 + time * 8);
          const len = R * (0.05 + 0.07 * major) * (1 + level * 0.8 * pulse * pulse);
          const a = m * TAU / 72 + time * 0.08;
          const rad = R * 1.85 + al * len;
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = 0;
          hue = 0.52 - major * 0.03;
          sat = 0.85 - major * 0.3;
          lit = 0.35 + major * 0.3 + level * 0.15;
        } else if (tt < 0.88) {
          const k = (tt - 0.70) / 0.18;
          const layer = Math.floor(h * 3);
          const a = k * TAU;
          const wv = Math.sin(a * 7 + time * 9) * 0.5 + Math.sin(a * 13 - time * 13) * 0.3 + Math.sin(a * 3 + time * 5) * 0.2;
          const wave = level * R * 0.2 * wv * (1 - layer * 0.25);
          const rad = R * 1.3 + layer * R * 0.05 + wave + (h2 - 0.5) * R * 0.01;
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = layer * R * 0.02;
          hue = 0.55 - level * 0.05;
          sat = 0.9 - level * 0.4;
          lit = Math.min(0.92, 0.45 + level * 0.4 + Math.abs(wv) * level * 0.2);
        } else if (tt < 0.95) {
          const sw = time * 1.1;
          const trail = h2 * 1.2;
          const a = sw - trail;
          const rad = R * (0.3 + 1.15 * h);
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = (h - 0.5) * R * 0.02;
          hue = 0.5;
          sat = 0.8;
          lit = 0.12 + 0.5 * (1 - trail / 1.2) * (0.6 + level * 0.4);
        } else {
          const hh = h + time * (0.15 + level * 0.5);
          const life = hh - Math.floor(hh);
          const a = i * 2.3;
          const rad = R * (0.2 + life * 2.0);
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = (h2 - 0.5) * R * 0.4 * life;
          hue = 0.5;
          sat = 0.7;
          lit = Math.min(0.9, 0.1 + 0.7 * (1 - life) * (0.4 + level));
        }
        
        const sway = Math.sin(time * 0.25) * 0.25;
        const cs = Math.cos(sway);
        const sn = Math.sin(sway);
        const x2 = x * cs + z * sn;
        const z2 = -x * sn + z * cs;
        const ct = Math.cos(tilt);
        const st = Math.sin(tilt);
        target.set(x2, y * ct - z2 * st, y * st + z2 * ct);
        
        color.setHSL(hue - warm * 0.44, Math.min(1, Math.max(0, sat)), Math.min(0.95, Math.max(0.02, lit)));
        
        if (i === 0) {
          setInfo("J.A.R.V.I.S. Interface", "Holographic HUD: arc-reactor core, counter-rotating segmented rings, radar sweep, and a voice waveform ring that reacts to speech level.");
          annotate("core", new THREE.Vector3(0, 0, 0), "J.A.R.V.I.S.");
          annotate("wave", new THREE.Vector3(0, size * 1.45, 0), "Voice Analysis");
        }
        // USER CODE END

        if (MOUSE_MODE !== 'none') {
            const d = target.distanceTo(mouse3D);
            if (d < MOUSE_INFLUENCE * 10) {
                const dir = target.clone().sub(mouse3D).normalize();
                if (MOUSE_MODE === 'attract') target.sub(dir.multiplyScalar((MOUSE_INFLUENCE*10 - d)*0.05));
                else if (MOUSE_MODE === 'repel') target.add(dir.multiplyScalar((MOUSE_INFLUENCE*10 - d)*0.05));
                else if (MOUSE_MODE === 'vortex') {
                    const tangent = new THREE.Vector3(-dir.y, dir.x, 0);
                    target.add(tangent.multiplyScalar((MOUSE_INFLUENCE*10 - d)*0.05));
                }
            }
        }

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

const CustomVignetteShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'offset': { value: 1.0 },
        'darkness': { value: 1.0 },
        'color': { value: new THREE.Color('#000000') }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: `
        uniform float offset;
        uniform float darkness;
        uniform vec3 color;
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
            vec4 texel = texture2D( tDiffuse, vUv );
            vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );
            float mixFactor = clamp(dot(uv, uv) * darkness, 0.0, 1.0);
            gl_FragColor = vec4( mix( texel.rgb, color, mixFactor ), texel.a );
        }
    `
};

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
        <ParticleSwarm />
        <OrbitControls autoRotate={true} />
        <Effects disableGamma>
            <unrealBloomPass threshold={0.25} strength={0.5} radius={0.3} />
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            <shaderPass args={[{
                uniforms: { tDiffuse: { value: null }, bgColor: { value: new THREE.Color('#000000') } },
                vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 bgColor; varying vec2 vUv; void main() { vec4 texel = texture2D(tDiffuse, vUv); float alpha = clamp(max(texel.r, max(texel.g, texel.b)), 0.0, 1.0); gl_FragColor = vec4(texel.rgb + bgColor * (1.0 - alpha), 1.0); }`
            }]} />
            
        </Effects>
      </Canvas>
    </div>
  );
}