import React, { useState, useEffect } from 'react';
import { statsApi, authApi, bookingApi } from '../services/api';
import { Users, Plane, FileText, UserPlus, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalFlights: 0, totalBookings: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state to create staff
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        statsApi.getStatistics(),
        authApi.getAllUsers(),
        bookingApi.getAllBookings(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load administrative dashboard data. Make sure you are signed in as Administrator.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setFormLoading(true);

    try {
      await authApi.createStaff({ username, email, fullName, password });
      setFormSuccess(true);
      setUsername('');
      setEmail('');
      setFullName('');
      setPassword('');
      setFormLoading(false);
      // Reload stats and users
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create staff account.');
      setFormLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading admin portal...</div>;
  if (error) return <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center text-sm max-w-2xl mx-auto my-10 border border-red-200">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-screen">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Operations Control</h1>
        <p className="text-sm text-slate-500">Monitor microservices aggregates, manage staff accounts, and audit transactions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-airline-600 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Registered Accounts</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.totalUsers}</span>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <Plane className="h-6 w-6 transform rotate-45" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Active Air Routes</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.totalFlights}</span>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Global Bookings</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.totalBookings}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Accounts and Bookings */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Log */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <Users className="h-5 w-5 text-airline-600" />
              <span>User Registries</span>
            </h2>
            <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0">
                      <th className="py-3 px-5">Full Name</th>
                      <th className="py-3 px-5">Username</th>
                      <th className="py-3 px-5">Email</th>
                      <th className="py-3 px-5">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-5 font-bold text-slate-700">{u.fullName}</td>
                        <td className="py-2.5 px-5 font-mono">{u.username}</td>
                        <td className="py-2.5 px-5">{u.email}</td>
                        <td className="py-2.5 px-5">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            u.role === 'Administrator' ? 'bg-red-50 text-red-600' :
                            u.role === 'Staff' ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-airline-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bookings Audit Log */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Transactional Bookings Audit</span>
            </h2>
            <div className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0">
                      <th className="py-3 px-5">Reference</th>
                      <th className="py-3 px-5">User ID</th>
                      <th className="py-3 px-5">Seats</th>
                      <th className="py-3 px-5">Amount</th>
                      <th className="py-3 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">No booking records found.</td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-5 font-mono font-bold text-slate-700">{b.bookingReference}</td>
                          <td className="py-2.5 px-5">User #{b.userId}</td>
                          <td className="py-2.5 px-5">{b.tickets?.length || 0} seats</td>
                          <td className="py-2.5 px-5 font-bold text-slate-800">${b.totalPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-5">
                            <span className={`inline-flex items-center space-x-1 font-bold px-2 py-0.5 rounded-full uppercase scale-90 border ${
                              b.status === 'Confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                            }`}>
                              {b.status === 'Confirmed' ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                              <span>{b.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create Staff Form */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            <span>Provision Staff Account</span>
          </h2>
          <div className="glass-panel p-6 rounded-3xl shadow-sm border border-slate-200/50 bg-white/70">
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Staff user provisioned successfully!</span>
              </div>
            )}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <input required type="text" placeholder="Staff Name" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Username</label>
                <input required type="text" placeholder="staff_username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input required type="email" placeholder="staff@skylink.com" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Temporary Password</label>
                <input required type="password" placeholder="Min 8 characters" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-airline-500 outline-none" />
              </div>
              <button disabled={formLoading} type="submit" className="w-full mt-2 bg-airline-600 hover:bg-airline-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow">
                {formLoading ? 'Creating...' : 'Provision Staff'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
