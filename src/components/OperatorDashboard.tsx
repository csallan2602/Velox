import React, { useState } from 'react';
import { Bicycle, Booking, Station, MaintenanceRecord, PlatformStats } from '../types';
import { api } from '../services/api';
import { 
  Shield, 
  Bike, 
  Wrench, 
  CheckCircle2, 
  Plus, 
  Search, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  DollarSign, 
  MapPin, 
  ArrowUpDown, 
  Activity,
  Trash2,
  Edit3
} from 'lucide-react';

interface OperatorDashboardProps {
  bikes: Bicycle[];
  bookings: Booking[];
  stations: Station[];
  maintenance: MaintenanceRecord[];
  stats: PlatformStats | null;
  onRefreshAll: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  bikes,
  bookings,
  stations,
  maintenance,
  stats,
  onRefreshAll
}) => {
  const [operatorTab, setOperatorTab] = useState<'counter' | 'fleet' | 'maintenance' | 'stations'>('counter');
  const [searchPinOrId, setSearchPinOrId] = useState<string>('');
  
  // New Bike Modal
  const [showAddBikeModal, setShowAddBikeModal] = useState<boolean>(false);
  const [newBikeName, setNewBikeName] = useState<string>('');
  const [newBikeCategory, setNewBikeCategory] = useState<'Electric' | 'Mountain' | 'Road' | 'City Cruiser' | 'Hybrid'>('Electric');
  const [newBikeRateHour, setNewBikeRateHour] = useState<number>(3.50);
  const [newBikeStation, setNewBikeStation] = useState<string>(stations[0]?.name || 'Central Station Terminal');
  const [newBikeGears, setNewBikeGears] = useState<string>('Shimano Nexus 7-Speed');
  const [newBikeFrame, setNewBikeFrame] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [newBikeDesc, setNewBikeDesc] = useState<string>('');
  const [addBikeLoading, setAddBikeLoading] = useState<boolean>(false);

  // New Maintenance Ticket Modal
  const [showAddMntModal, setShowAddMntModal] = useState<boolean>(false);
  const [mntBikeId, setMntBikeId] = useState<string>(bikes[0]?.id || '');
  const [mntIssue, setMntIssue] = useState<string>('');
  const [mntPriority, setMntPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [mntCost, setMntCost] = useState<number>(15.00);
  const [mntLoading, setMntLoading] = useState<boolean>(false);

  // Quick Action Feedback Toast
  const [toast, setToast] = useState<string | null>(null);

  // Filtered Bookings for Counter lookup
  const filteredBookings = bookings.filter(b => {
    if (!searchPinOrId.trim()) return true;
    const q = searchPinOrId.toLowerCase().trim();
    return b.pickupPin.includes(q) || b.id.toLowerCase().includes(q) || b.customerName.toLowerCase().includes(q) || b.bicycleName.toLowerCase().includes(q);
  });

  // Calculations
  const availableCount = bikes.filter(b => b.status === 'available').length;
  const rentedCount = bikes.filter(b => b.status === 'rented').length;
  const maintenanceCount = bikes.filter(b => b.status === 'maintenance').length;
  const reservedCount = bikes.filter(b => b.status === 'reserved').length;
  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + b.totalAmount : sum, 0);

  const handleUpdateBooking = async (id: string, status: string, returnStation?: string) => {
    try {
      await api.updateBookingStatus(id, status, returnStation);
      setToast(`Booking ${id} status updated to ${status}`);
      onRefreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const handleUpdateBikeStatus = async (bikeId: string, status: any) => {
    try {
      await api.updateBike(bikeId, { status });
      setToast(`Bicycle ${bikeId} set to ${status}`);
      onRefreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update bike status');
    }
  };

  const handleDeleteBike = async (bikeId: string) => {
    if (!confirm('Are you sure you want to remove this bicycle from active inventory?')) return;
    try {
      await api.deleteBike(bikeId);
      setToast(`Bicycle ${bikeId} removed`);
      onRefreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete bicycle');
    }
  };

  const handleCreateBike = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBikeName) return;
    setAddBikeLoading(true);
    try {
      await api.createBike({
        name: newBikeName,
        category: newBikeCategory,
        ratePerHour: newBikeRateHour,
        ratePerDay: newBikeRateHour * 6,
        station: newBikeStation,
        gears: newBikeGears,
        frameSize: newBikeFrame,
        description: newBikeDesc || 'Calibrated fleet bicycle ready for immediate rider checkout.'
      });
      setShowAddBikeModal(false);
      setNewBikeName('');
      setNewBikeDesc('');
      setToast('New bicycle registered to station inventory!');
      onRefreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add bicycle');
    } finally {
      setAddBikeLoading(false);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mntIssue) return;
    setMntLoading(true);
    try {
      await api.createMaintenanceRecord({
        bicycleId: mntBikeId,
        issueDescription: mntIssue,
        priority: mntPriority,
        cost: mntCost,
        reportedBy: 'Station Operator Counter'
      });
      setShowAddMntModal(false);
      setMntIssue('');
      setToast('Maintenance ticket opened; bicycle marked in-service');
      onRefreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to file maintenance ticket');
    } finally {
      setMntLoading(false);
    }
  };

  const handleResolveMaintenance = async (mntId: string) => {
    try {
      await api.updateMaintenanceRecord(mntId, { status: 'resolved' });
      setToast('Maintenance ticket resolved. Bicycle restored to available fleet.');
      onRefreshAll();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Feedback */}
      {toast && (
        <div className="alert alert-info shadow-md text-white font-medium text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {toast}
          </span>
          <button onClick={() => setToast(null)} className="btn btn-ghost btn-xs text-white">✕</button>
        </div>
      )}

      {/* Operator Header & DB Mode Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold font-display text-base-content">
              Operator Command Center
            </h2>
          </div>
          <p className="text-xs text-base-content/65 mt-1">
            Station staff counter for rider PIN validation, instant check-outs, return dock intake, and fleet maintenance.
          </p>
        </div>

        {/* Database Status & Sync */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-base-200 border border-base-300 flex items-center gap-2 text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-base-content/70">Database:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.dbType === 'mongodb' ? 'MongoDB Atlas' : 'In-Memory Fallback'}
            </span>
          </div>

          <button
            onClick={onRefreshAll}
            className="btn btn-sm btn-ghost btn-circle"
            title="Refresh System Data"
          >
            <RefreshCw className="w-4 h-4 text-base-content/60" />
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-base-100 border border-base-200 shadow-xs">
          <span className="text-[11px] text-base-content/60 uppercase font-mono font-medium">Total Fleet</span>
          <div className="text-2xl font-bold font-mono text-base-content mt-1 tabular-nums">{bikes.length}</div>
          <span className="text-[10px] text-base-content/40">Registered bikes</span>
        </div>

        <div className="p-3.5 rounded-xl bg-base-100 border border-base-200 shadow-xs">
          <span className="text-[11px] text-base-content/60 uppercase font-mono font-medium">Available</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {availableCount}
          </div>
          <span className="text-[10px] text-base-content/40">Ready on docks</span>
        </div>

        <div className="p-3.5 rounded-xl bg-base-100 border border-base-200 shadow-xs">
          <span className="text-[11px] text-base-content/60 uppercase font-mono font-medium">Rented Out</span>
          <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
            {rentedCount}
          </div>
          <span className="text-[10px] text-base-content/40">Active commutes</span>
        </div>

        <div className="p-3.5 rounded-xl bg-base-100 border border-base-200 shadow-xs">
          <span className="text-[11px] text-base-content/60 uppercase font-mono font-medium">Reserved</span>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1 tabular-nums">
            {reservedCount}
          </div>
          <span className="text-[10px] text-base-content/40">Awaiting pickup</span>
        </div>

        <div className="p-3.5 rounded-xl bg-base-100 border border-base-200 shadow-xs">
          <span className="text-[11px] text-base-content/60 uppercase font-mono font-medium">Under Repair</span>
          <div className="text-2xl font-bold font-mono text-rose-500 mt-1 tabular-nums">
            {maintenanceCount}
          </div>
          <span className="text-[10px] text-base-content/40">Mechanic service</span>
        </div>

        <div className="p-3.5 rounded-xl bg-base-100 border border-base-200 shadow-xs">
          <span className="text-[11px] text-base-content/60 uppercase font-mono font-medium">Platform Revenue</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            ${totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-base-content/40">Processed rentals</span>
        </div>
      </div>

      {/* Operator Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-base-200 rounded-xl overflow-x-auto">
        <button
          onClick={() => setOperatorTab('counter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            operatorTab === 'counter'
              ? 'bg-base-100 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-base-content/70 hover:text-base-content'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Counter Check-In & Pickups</span>
        </button>

        <button
          onClick={() => setOperatorTab('fleet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            operatorTab === 'fleet'
              ? 'bg-base-100 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-base-content/70 hover:text-base-content'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Fleet Inventory Manager</span>
        </button>

        <button
          onClick={() => setOperatorTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            operatorTab === 'maintenance'
              ? 'bg-base-100 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-base-content/70 hover:text-base-content'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Maintenance & Repairs ({maintenance.filter(m => m.status !== 'resolved').length})</span>
        </button>

        <button
          onClick={() => setOperatorTab('stations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            operatorTab === 'stations'
              ? 'bg-base-100 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-base-content/70 hover:text-base-content'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Dock Capacity & Stations</span>
        </button>
      </div>

      {/* TAB 1: Counter Check-In & Pickups */}
      {operatorTab === 'counter' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-base-100 border border-base-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                type="text"
                placeholder="Search by 4-Digit Pickup PIN, Voucher ID, or Rider Name..."
                value={searchPinOrId}
                onChange={(e) => setSearchPinOrId(e.target.value)}
                className="input input-sm input-bordered w-full pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-base-content/50">
              Showing {filteredBookings.length} booking records
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-base-200 bg-base-100">
            <table className="table table-zebra table-sm w-full">
              <thead>
                <tr className="text-base-content/60 text-xs">
                  <th>Pickup PIN</th>
                  <th>Voucher ID</th>
                  <th>Rider Name</th>
                  <th>Bicycle</th>
                  <th>Pickup Dock</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th className="text-right">Counter Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="font-mono font-extrabold text-sm px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {b.pickupPin}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-base-content/80">{b.id}</td>
                    <td>
                      <div className="font-semibold text-base-content">{b.customerName}</div>
                      <div className="text-[10px] text-base-content/50">{b.customerPhone}</div>
                    </td>
                    <td className="font-medium text-base-content">{b.bicycleName}</td>
                    <td>{b.pickupStation}</td>
                    <td className="font-mono">{b.durationHours} hrs</td>
                    <td>
                      <span className={`badge badge-sm font-medium ${
                        b.status === 'active' ? 'badge-success text-white' :
                        b.status === 'reserved' ? 'badge-warning text-slate-900' :
                        b.status === 'completed' ? 'badge-ghost' : 'badge-error text-white'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'reserved' && (
                          <button
                            onClick={() => handleUpdateBooking(b.id, 'active')}
                            className="btn btn-xs btn-primary text-white"
                          >
                            Check-Out Bike
                          </button>
                        )}
                        {b.status === 'active' && (
                          <button
                            onClick={() => handleUpdateBooking(b.id, 'completed', b.pickupStation)}
                            className="btn btn-xs btn-success text-white"
                          >
                            Accept Return
                          </button>
                        )}
                        {b.status === 'reserved' && (
                          <button
                            onClick={() => handleUpdateBooking(b.id, 'cancelled')}
                            className="btn btn-xs btn-ghost text-rose-500"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Fleet Inventory Manager */}
      {operatorTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70 font-mono">
              Bicycle Fleet Directory ({bikes.length} units)
            </h3>
            <button
              onClick={() => setShowAddBikeModal(true)}
              className="btn btn-sm btn-primary text-white text-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Bicycle</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-base-200 bg-base-100">
            <table className="table table-zebra table-sm w-full">
              <thead>
                <tr className="text-base-content/60 text-xs">
                  <th>ID</th>
                  <th>Model Name</th>
                  <th>Category</th>
                  <th>Station Dock</th>
                  <th>Rate/Hr</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {bikes.map((bike) => (
                  <tr key={bike.id}>
                    <td className="font-mono font-bold text-base-content/60">{bike.id}</td>
                    <td>
                      <div className="font-semibold text-base-content">{bike.name}</div>
                      <div className="text-[10px] text-base-content/50">{bike.gears} · Size {bike.frameSize}</div>
                    </td>
                    <td>{bike.category}</td>
                    <td>{bike.station}</td>
                    <td className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${bike.ratePerHour.toFixed(2)}
                    </td>
                    <td>
                      <span className="font-mono text-amber-500 font-semibold">
                        ★ {bike.conditionScore.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <select
                        value={bike.status}
                        onChange={(e) => handleUpdateBikeStatus(bike.id, e.target.value)}
                        className="select select-xs select-bordered font-medium"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeleteBike(bike.id)}
                        className="btn btn-ghost btn-xs text-rose-500"
                        title="Delete from Fleet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Maintenance & Repair Log */}
      {operatorTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70 font-mono">
              Fleet Damage & Inspection Tickets
            </h3>
            <button
              onClick={() => setShowAddMntModal(true)}
              className="btn btn-sm btn-error text-white text-xs gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Damage / Issue</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-base-200 bg-base-100">
            <table className="table table-zebra table-sm w-full">
              <thead>
                <tr className="text-base-content/60 text-xs">
                  <th>Ticket ID</th>
                  <th>Bicycle</th>
                  <th>Issue Description</th>
                  <th>Reported By</th>
                  <th>Priority</th>
                  <th>Cost Est.</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {maintenance.map((mnt) => (
                  <tr key={mnt.id}>
                    <td className="font-mono font-bold text-base-content/70">{mnt.id}</td>
                    <td className="font-semibold text-base-content">{mnt.bicycleName}</td>
                    <td className="max-w-xs">{mnt.issueDescription}</td>
                    <td className="text-base-content/60">{mnt.reportedBy}</td>
                    <td>
                      <span className={`badge badge-sm font-medium ${
                        mnt.priority === 'critical' ? 'badge-error text-white' :
                        mnt.priority === 'high' ? 'badge-warning text-slate-900' : 'badge-ghost'
                      }`}>
                        {mnt.priority}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-base-content">
                      ${mnt.cost.toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge badge-sm font-medium ${
                        mnt.status === 'resolved' ? 'badge-success text-white' : 'badge-warning text-slate-900'
                      }`}>
                        {mnt.status}
                      </span>
                    </td>
                    <td className="text-right">
                      {mnt.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveMaintenance(mnt.id)}
                          className="btn btn-xs btn-success text-white"
                        >
                          Mark Repaired
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Dock Capacity & Stations */}
      {operatorTab === 'stations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => {
            const bikesAtStation = bikes.filter(b => b.station === st.name);
            const availableAtStation = bikesAtStation.filter(b => b.status === 'available').length;
            const occupancyPercent = Math.round((bikesAtStation.length / st.totalDocks) * 100);

            return (
              <div key={st.id} className="p-5 rounded-2xl bg-base-100 border border-base-200 shadow-xs flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-base text-base-content">{st.name}</h4>
                    <span className="badge badge-sm badge-ghost font-mono">{st.id}</span>
                  </div>
                  <p className="text-xs text-base-content/60 mt-1">{st.address}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-base-content/70">Dock Occupancy:</span>
                      <span className="font-mono font-bold text-base-content">
                        {bikesAtStation.length} / {st.totalDocks} ({occupancyPercent}%)
                      </span>
                    </div>

                    <progress
                      className={`progress w-full ${
                        occupancyPercent > 80 ? 'progress-warning' : 'progress-success'
                      }`}
                      value={bikesAtStation.length}
                      max={st.totalDocks}
                    />

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Ready to Rent: {availableAtStation}
                      </span>
                      <span className="text-base-content/50">
                        Free Docks: {st.totalDocks - bikesAtStation.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Register New Bicycle */}
      {showAddBikeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form onSubmit={handleCreateBike} className="w-full max-w-lg bg-base-100 rounded-2xl p-6 shadow-2xl border border-base-300 space-y-4">
            <h3 className="text-lg font-bold font-display text-base-content">
              Register New Bicycle to Fleet
            </h3>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-base-content/80">Model / Bicycle Name</label>
                <input
                  type="text"
                  placeholder="e.g. AeroGlide Carbon Elite"
                  value={newBikeName}
                  onChange={(e) => setNewBikeName(e.target.value)}
                  className="input input-sm input-bordered w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Category</label>
                  <select
                    value={newBikeCategory}
                    onChange={(e: any) => setNewBikeCategory(e.target.value)}
                    className="select select-sm select-bordered w-full"
                  >
                    <option value="Electric">Electric</option>
                    <option value="Mountain">Mountain</option>
                    <option value="Road">Road</option>
                    <option value="City Cruiser">City Cruiser</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Rate / Hour ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    value={newBikeRateHour}
                    onChange={(e) => setNewBikeRateHour(parseFloat(e.target.value))}
                    className="input input-sm input-bordered w-full font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Initial Station Dock</label>
                  <select
                    value={newBikeStation}
                    onChange={(e) => setNewBikeStation(e.target.value)}
                    className="select select-sm select-bordered w-full"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Frame Size</label>
                  <select
                    value={newBikeFrame}
                    onChange={(e: any) => setNewBikeFrame(e.target.value)}
                    className="select select-sm select-bordered w-full"
                  >
                    <option value="Small">Small (15"-16")</option>
                    <option value="Medium">Medium (17"-18")</option>
                    <option value="Large">Large (19"-21")</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-base-content/80">Gears & Components</label>
                <input
                  type="text"
                  value={newBikeGears}
                  onChange={(e) => setNewBikeGears(e.target.value)}
                  className="input input-sm input-bordered w-full text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-base-content/80">Description</label>
                <textarea
                  value={newBikeDesc}
                  onChange={(e) => setNewBikeDesc(e.target.value)}
                  placeholder="Bicycle specifications, battery specs, or commuter suitability..."
                  className="textarea textarea-bordered text-xs h-16"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBikeModal(false)}
                className="btn btn-sm btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addBikeLoading}
                className="btn btn-sm btn-primary text-white text-xs px-5"
              >
                {addBikeLoading ? <span className="loading loading-spinner loading-xs" /> : 'Save & Add to Fleet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Report Maintenance Ticket */}
      {showAddMntModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form onSubmit={handleCreateMaintenance} className="w-full max-w-md bg-base-100 rounded-2xl p-6 shadow-2xl border border-base-300 space-y-4">
            <h3 className="text-lg font-bold font-display text-base-content flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-error" />
              File Damage & Inspection Report
            </h3>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-base-content/80">Select Bicycle</label>
                <select
                  value={mntBikeId}
                  onChange={(e) => setMntBikeId(e.target.value)}
                  className="select select-sm select-bordered w-full"
                >
                  {bikes.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.id}) - Dock: {b.station}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-base-content/80">Issue Description</label>
                <textarea
                  value={mntIssue}
                  onChange={(e) => setMntIssue(e.target.value)}
                  placeholder="e.g. Broken spoke on front wheel, worn brake pads, loose chain derailleur..."
                  className="textarea textarea-bordered text-xs h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Priority</label>
                  <select
                    value={mntPriority}
                    onChange={(e: any) => setMntPriority(e.target.value)}
                    className="select select-sm select-bordered w-full"
                  >
                    <option value="low">Low (Cosmetic)</option>
                    <option value="medium">Medium (Tuning)</option>
                    <option value="high">High (Brakes/Chain)</option>
                    <option value="critical">Critical (Safety Hold)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/80">Estimated Cost ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={mntCost}
                    onChange={(e) => setMntCost(parseFloat(e.target.value))}
                    className="input input-sm input-bordered w-full font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMntModal(false)}
                className="btn btn-sm btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mntLoading}
                className="btn btn-sm btn-error text-white text-xs px-4"
              >
                {mntLoading ? <span className="loading loading-spinner loading-xs" /> : 'File Ticket & Hold Bike'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
