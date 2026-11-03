import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Activity, Zap, Compass, Wind, Sparkles, Volume2, Eye, EyeOff } from 'lucide-react';

interface SmartHubProps {
  activeRides?: number;
  co2SavedKg?: number;
  compact?: boolean;
}

export const JarvisSmartHub: React.FC<SmartHubProps> = ({
  activeRides = 3,
  co2SavedKg = 184,
  compact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hudSpeed, setHudSpeed] = useState<number>(1.0);
  const [pulseMode, setPulseMode] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'eco' | 'cyan' | 'gold'>('eco');
  const [showControls, setShowControls] = useState<boolean>(false);
  const [telemetryLevel, setTelemetryLevel] = useState<number>(0.65);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL to balance performance
    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? (gl as any).getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(String(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    } catch {
      isSoftwareGl = false;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 1000);
    camera.position.set(0, 0, compact ? 95 : 85);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Particle Swarm Instancing
    const count = compact ? 8000 : 12000;
    const sphereGeo = new THREE.SphereGeometry(0.28, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });

    const instancedMesh = new THREE.InstancedMesh(sphereGeo, particleMat, count);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    }
    scene.add(instancedMesh);

    // Initial dummy object for matrix math
    const dummy = new THREE.Object3D();
    const pColor = new THREE.Color();
    const positions: THREE.Vector3[] = [];
    const targets: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      positions.push(pos);
      targets.push(new THREE.Vector3());
    }

    // Pointer Interaction
    const pointer = { x: 0, y: 0, active: false };
    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mouseleave', onPointerLeave);

    // Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const renderTick = () => {
      animId = requestAnimationFrame(renderTick);
      const time = clock.getElapsedTime() * hudSpeed;
      const TAU = Math.PI * 2;
      const R = compact ? 36 : 44;

      // Base Hue: Eco Green (0.42), Jarvis Cyan (0.52), Gold Amber (0.12)
      let baseHue = 0.44;
      if (themeMode === 'cyan') baseHue = 0.53;
      if (themeMode === 'gold') baseHue = 0.12;

      // Dynamic activity gate & pulse
      const waveGate = pulseMode ? Math.sin(time * 2.2) * 0.4 + 0.6 : telemetryLevel;
      const level = Math.min(1, Math.max(0.1, waveGate));

      for (let i = 0; i < count; i++) {
        const tt = i / count;
        let x = 0, y = 0, z = 0;
        let hue = baseHue;
        let sat = 0.85;
        let lit = 0.5;

        // Hash helpers
        const hs = Math.sin(i * 12.9898) * 43758.5453;
        const h = hs - Math.floor(hs);
        const hs2 = Math.sin(i * 78.233 + 1.7) * 12543.1234;
        const h2 = hs2 - Math.floor(hs2);

        if (tt < 0.12) {
          // 1. Arc Reactor / Central Eco Core (Sphere of glowing energy)
          const u = tt / 0.12;
          const ph = Math.acos(1 - 2 * u);
          const th = i * 2.39996;
          const cr = R * 0.18 * (0.35 + 0.65 * h) * (1 + level * 0.5 + 0.08 * Math.sin(time * 3 + h * 6));
          x = cr * Math.sin(ph) * Math.cos(th);
          y = cr * Math.cos(ph);
          z = cr * Math.sin(ph) * Math.sin(th);
          sat = 0.9;
          lit = Math.min(0.95, 0.55 + 0.3 * h + level * 0.2);
        } else if (tt < 0.55) {
          // 2. Segmented Counter-Rotating Telemetry Rings
          const k = (tt - 0.12) / 0.43;
          const kn = k * 4;
          const n = Math.floor(kn);
          const wn = kn - n;
          const segs = 6 + n * 4;
          const sc = wn * segs;
          const cell = Math.floor(sc);
          const fr = sc - cell;
          const dir = 1 - 2 * (n % 2);
          const a = (cell + fr * 0.6) * TAU / segs + time * (0.2 + 0.1 * n) * dir * (1 + level * 0.8);
          const rad = R * (0.42 + n * 0.24) * (1 + level * 0.03 * (n + 1) * Math.sin(time * 4 - n)) + (h - 0.5) * R * 0.02;
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = (n - 2) * R * 0.06 + (h2 - 0.5) * R * 0.02;
          hue = baseHue - n * 0.015;
          lit = 0.35 + 0.18 * Math.sin(a * 2 - time * 2.5) + level * 0.2;
        } else if (tt < 0.72) {
          // 3. Compass Teeth / Station Dock Gauges
          const k = (tt - 0.55) / 0.17;
          const km = k * 48;
          const m = Math.floor(km);
          const al = km - m;
          const major = m % 6 === 0 ? 1 : 0;
          const pulse = Math.sin(m * 0.5 + time * 6);
          const len = R * (0.05 + 0.06 * major) * (1 + level * 0.6 * pulse * pulse);
          const a = m * TAU / 48 + time * 0.06;
          const rad = R * 1.5 + al * len;
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = 0;
          hue = baseHue + major * 0.04;
          lit = 0.32 + major * 0.35 + level * 0.15;
        } else if (tt < 0.88) {
          // 4. Waveform Telemetry Ring (CO2 and speed metrics)
          const k = (tt - 0.72) / 0.16;
          const layer = Math.floor(h * 3);
          const a = k * TAU;
          const wv = Math.sin(a * 6 + time * 6) * 0.5 + Math.sin(a * 12 - time * 8) * 0.3;
          const wave = level * R * 0.16 * wv * (1 - layer * 0.25);
          const rad = R * 1.25 + layer * R * 0.04 + wave;
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = layer * R * 0.03;
          hue = baseHue - level * 0.03;
          lit = Math.min(0.92, 0.4 + level * 0.4 + Math.abs(wv) * 0.25);
        } else {
          // 5. Radar Sweep & Orbiting Sparkles
          const sw = time * 1.2;
          const trail = h2 * 1.2;
          const a = sw - trail;
          const rad = R * (0.3 + 1.2 * h);
          x = Math.cos(a) * rad;
          y = Math.sin(a) * rad;
          z = (h - 0.5) * R * 0.05;
          hue = baseHue + 0.05;
          lit = 0.15 + 0.6 * (1 - trail / 1.2) * (0.5 + level * 0.5);
        }

        // Pointer Parallax
        if (pointer.active) {
          x += pointer.x * 6;
          y += pointer.y * 6;
        }

        // 3D Tilt & Gentle Sway
        const tilt = 0.32;
        const sway = Math.sin(time * 0.3) * 0.2;
        const cs = Math.cos(sway);
        const sn = Math.sin(sway);
        const x2 = x * cs + z * sn;
        const z2 = -x * sn + z * cs;
        const ct = Math.cos(tilt);
        const st = Math.sin(tilt);

        targets[i].set(x2, y * ct - z2 * st, y * st + z2 * ct);

        // Lerp position smoothly
        positions[i].lerp(targets[i], 0.12);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        pColor.setHSL(hue, sat, lit);
        instancedMesh.setColorAt(i, pColor);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    renderTick();

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mouseleave', onPointerLeave);
      renderer.dispose();
      sphereGeo.dispose();
      particleMat.dispose();
      if (container) container.innerHTML = '';
    };
  }, [hudSpeed, pulseMode, themeMode, telemetryLevel, compact]);

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/80 border border-emerald-500/20 shadow-2xl backdrop-blur-md">
      {/* 3D WebGL Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Holographic Top HUD Badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-emerald-400 font-mono text-xs shadow-lg backdrop-blur-sm">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span className="font-semibold tracking-wider">VELOX SMART-HUB HUD</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">ACTIVE: {activeRides} BIKES</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-teal-500/30 text-teal-300 font-mono text-xs backdrop-blur-sm">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>CO₂ SAVED: <strong className="text-white tabular-nums">{co2SavedKg} kg</strong></span>
          </div>

          <button
            onClick={() => setShowControls(!showControls)}
            className="btn btn-xs btn-outline btn-success gap-1 font-mono text-xs bg-slate-900/80 backdrop-blur-sm"
            title="Toggle Hologram Controls"
          >
            {showControls ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showControls ? 'Hide HUD' : 'HUD Controls'}</span>
          </button>
        </div>
      </div>

      {/* Center Reticle Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border border-emerald-500/10 animate-spin" style={{ animationDuration: '30s' }} />
        <div className="w-64 h-64 rounded-full border border-dashed border-teal-500/15 animate-spin" style={{ animationDuration: '50s', animationDirection: 'reverse' }} />
      </div>

      {/* Collapsible Ergonomic Bottom Dock */}
      {showControls && (
        <div className="absolute bottom-4 inset-x-4 max-w-md mx-auto p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-xl backdrop-blur-md z-20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Zap className="w-3.5 h-3.5" /> Holographic Telemetry Engine
            </span>
            <span className="text-slate-400">12,000 Particles</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Speed Control */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-mono">Rotation Speed</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={hudSpeed}
                  onChange={(e) => setHudSpeed(parseFloat(e.target.value))}
                  className="range range-xs range-success flex-1"
                />
                <span className="font-mono text-[11px] text-emerald-300 w-8 tabular-nums">{hudSpeed.toFixed(1)}x</span>
              </div>
            </div>

            {/* Pulse Intensity */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-mono">Pulse Energy</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={telemetryLevel}
                  onChange={(e) => setTelemetryLevel(parseFloat(e.target.value))}
                  className="range range-xs range-accent flex-1"
                />
                <span className="font-mono text-[11px] text-teal-300 w-8 tabular-nums">{Math.round(telemetryLevel * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Theme Palette Swatches */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Color Spectrum</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setThemeMode('eco')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                  themeMode === 'eco'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                Eco Emerald
              </button>
              <button
                onClick={() => setThemeMode('cyan')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                  themeMode === 'cyan'
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                }`}
              >
                Jarvis Cyan
              </button>
              <button
                onClick={() => setThemeMode('gold')}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                  themeMode === 'gold'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                Solar Amber
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
