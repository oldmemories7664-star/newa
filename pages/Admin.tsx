
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, update, remove, set, push } from 'firebase/database';
import { 
  Users, CreditCard, BarChart3, Crown, 
  DollarSign, Search, Trash2,
  ShieldCheck, Settings, 
  Palette, LogOut, X, 
  Menu as MenuIcon, ToggleLeft, ToggleRight,
  ShieldAlert, ArrowLeft, MoreVertical, Edit3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dash' | 'users' | 'requests' | 'theme' | 'settings'>('dash');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [stats, setStats] = useState({ totalUsers: 0, activePremium: 0, pendingRequests: 0, revenue: 0 });
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const navigate = useNavigate();

  useEffect(() => {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const userList = Object.values(data);
        setUsers(userList);
        setFilteredUsers(userList);
        const premiumCount = userList.filter((u: any) => u.is_premium).length;
        setStats(prev => ({ ...prev, totalUsers: userList.length, activePremium: premiumCount }));

        const now = Date.now();
        const dailyCounts: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date(now - (i * 86400000)).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          dailyCounts[date] = 0;
        }
        userList.forEach((u: any) => {
          const date = new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          if (dailyCounts[date] !== undefined) dailyCounts[date]++;
        });
        setGrowthData(Object.entries(dailyCounts).map(([day, users]) => ({ day, users })).reverse());
      }
    });

    onValue(ref(db, 'premium_requests'), (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        setRequests(list);
        setStats(prev => ({ ...prev, pendingRequests: list.filter(r => r.status === 'pending').length }));
      }
    });

    onValue(ref(db, 'app_settings'), (snap) => {
      const data = snap.val();
      setAppSettings(data);
      if (data) setStats(prev => ({ ...prev, revenue: data.total_revenue || 0 }));
    });
  }, []);

  useEffect(() => {
    const lower = userSearch.toLowerCase();
    setFilteredUsers(users.filter(u => 
      u.username?.toLowerCase().includes(lower) || 
      u.email?.toLowerCase().includes(lower)
    ));
  }, [userSearch, users]);

  const handleApprove = async (req: any) => {
    try {
      const duration = req.duration_days || 30;
      const expiry = Date.now() + (duration * 86400000);
      await update(ref(db, `premium_requests/${req.id}`), { status: 'approved' });
      await update(ref(db, `users/${req.uid}`), { is_premium: true, premium_expiry_timestamp: expiry, ads_disabled: true });
      const price = parseInt(req.plan_price.replace(/\D/g, '')) || 0;
      await update(ref(db, 'app_settings'), { total_revenue: (appSettings.total_revenue || 0) + price });
      alert('Approved!');
    } catch (e: any) { alert(e.message); }
  };

  const handleReject = async (req: any) => {
    if (!window.confirm('Reject this request?')) return;
    try {
      await update(ref(db, `premium_requests/${req.id}`), { status: 'rejected' });
      const notifRef = push(ref(db, 'notifications'));
      await set(notifRef, {
        title: 'Payment Rejected',
        message: `Your request for ${req.plan_name} was rejected. Check your Transaction ID.`,
        related_uid: req.uid,
        is_read: false,
        created_at: Date.now(),
        type: 'rejection'
      });
      alert('Rejected!');
    } catch (e: any) { alert(e.message); }
  };

  const deleteUser = async (uid: string) => {
    if (window.confirm('Permanently remove this user?')) {
      await remove(ref(db, `users/${uid}`));
    }
  };

  const togglePremium = async (u: any) => {
    await update(ref(db, `users/${u.uid}`), { is_premium: !u.is_premium });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#070312] text-white flex overflow-hidden">
      <aside className={`fixed lg:relative z-50 w-72 h-full bg-[#0a051a] border-r border-white/5 flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 h-20 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00f2ff] rounded-xl flex items-center justify-center text-black shadow-lg shadow-[#00f2ff]/20">
              <ShieldCheck size={24} />
            </div>
            <span className="font-black italic text-xl">STUDIO</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 opacity-50"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dash', label: 'Dashboard', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'requests', label: 'Premium', icon: CreditCard },
            { id: 'theme', label: 'Themes', icon: Palette },
            { id: 'settings', label: 'App Config', icon: Settings },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === item.id ? 'bg-[#00f2ff] text-black shadow-lg shadow-[#00f2ff]/20' : 'text-white/30 hover:bg-white/5'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
           <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 p-4 rounded-xl text-white/40 hover:text-white transition-all text-xs font-black uppercase"><ArrowLeft size={18}/> Studio Home</button>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-y-auto bg-[#070312]">
        <header className="sticky top-0 z-20 bg-[#070312]/80 backdrop-blur-xl h-20 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#00f2ff]"><MenuIcon /></button>
            <h1 className="text-lg lg:text-xl font-black uppercase tracking-widest">{activeTab} Control</h1>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {activeTab === 'dash' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { label: 'Total Nodes', val: stats.totalUsers, icon: Users, color: 'text-blue-400' },
                  { label: 'Pro Nodes', val: stats.activePremium, icon: Crown, color: 'text-pink-500' },
                  { label: 'Requests', val: stats.pendingRequests, icon: CreditCard, color: 'text-amber-500' },
                  { label: 'Revenue', val: `₹${stats.revenue}`, icon: DollarSign, color: 'text-green-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-[#0a051a] p-4 lg:p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between mb-2 lg:mb-4 text-white/30"><span className="text-[8px] lg:text-[10px] font-black uppercase">{s.label}</span><s.icon size={16}/></div>
                    <div className={`text-xl lg:text-3xl font-black ${s.color}`}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="h-[300px] lg:h-[400px] bg-[#0a051a] rounded-3xl p-4 lg:p-8 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs><linearGradient id="colorU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0a051a', border: 'none', borderRadius: '15px' }} />
                    <Area type="monotone" dataKey="users" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorU)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="glass border border-white/10 rounded-2xl flex items-center px-4 max-w-xl mx-auto lg:mx-0">
                <Search size={18} className="text-white/30" />
                <input 
                  placeholder="Search user..." 
                  className="w-full bg-transparent border-none p-4 outline-none text-sm font-bold uppercase tracking-widest"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((u) => (
                  <div key={u.uid} className="bg-[#0a051a] p-5 rounded-[30px] border border-white/5 hover:border-[#00f2ff]/30 transition-all group relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xl text-[#00f2ff] border border-white/5">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm uppercase truncate">{u.username}</h4>
                        <p className="text-[10px] text-white/30 font-mono truncate">{u.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${u.is_premium ? 'bg-pink-500/10 border-pink-500/30 text-pink-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                        {u.is_premium ? 'PRO' : 'FREE'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        Joined: {new Date(u.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => togglePremium(u)}
                          className={`p-3 rounded-xl transition-all ${u.is_premium ? 'bg-pink-500/10 text-pink-500' : 'bg-[#00f2ff]/10 text-[#00f2ff]'} hover:scale-110`}
                          title="Toggle Premium"
                        >
                          <Crown size={16} />
                        </button>
                        <button 
                          onClick={() => deleteUser(u.uid)}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all hover:scale-110"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center opacity-10 uppercase font-black tracking-widest text-sm">No Matching Nodes Found</div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4 animate-in fade-in">
              {requests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="bg-[#0a051a] p-6 rounded-[35px] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="w-16 h-16 shrink-0 bg-white/5 rounded-2xl flex items-center justify-center text-[#ff00c8] border border-white/10"><CreditCard size={32}/></div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-lg uppercase truncate">{req.username}</h4>
                      <p className="text-[10px] font-mono text-[#00f2ff] bg-[#00f2ff]/5 inline-block px-2 py-1 rounded-md mt-1">TRX: {req.transaction_id}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-[9px] font-black bg-pink-500/10 text-pink-500 px-3 py-1 rounded-full uppercase border border-pink-500/20">{req.plan_name}</span>
                        <span className="text-[9px] font-black bg-white/5 text-white/40 px-3 py-1 rounded-full uppercase border border-white/10">{req.plan_price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full lg:w-auto">
                    <button onClick={() => handleApprove(req)} className="flex-1 lg:flex-none px-8 py-4 bg-[#00ff9d] text-black font-black text-[10px] rounded-2xl uppercase shadow-lg shadow-[#00ff9d]/10 transition-all active:scale-95">Approve</button>
                    <button onClick={() => handleReject(req)} className="flex-1 lg:flex-none px-8 py-4 bg-red-500/10 text-red-500 font-black text-[10px] rounded-2xl uppercase border border-red-500/20 transition-all active:scale-95">Reject</button>
                  </div>
                </div>
              ))}
              {requests.filter(r => r.status === 'pending').length === 0 && (
                <div className="py-20 text-center opacity-10 uppercase font-black tracking-widest text-sm">No Pending Verification Nodes</div>
              )}
            </div>
          )}

          {(activeTab === 'theme' || activeTab === 'settings') && (
            <div className="bg-[#0a051a] rounded-[40px] p-6 lg:p-10 border border-white/5 max-w-4xl">
              <h3 className="text-xl font-black mb-10 flex items-center gap-3">
                {activeTab === 'theme' ? <Palette className="text-pink-500" /> : <Settings className="text-blue-400" />}
                SYSTEM {activeTab.toUpperCase()}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeTab === 'settings' && ['app_name', 'app_logo_url', 'upi_id', 'ads_provider_id'].map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">{key.replace(/_/g, ' ')}</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#00f2ff] outline-none transition-all" value={appSettings?.[key] || ''} onChange={(e) => update(ref(db, 'app_settings'), { [key]: e.target.value })} />
                  </div>
                ))}
                {activeTab === 'theme' && ['primary_bg', 'card_bg', 'accent_color', 'text_primary', 'border_color'].map(key => (
                  <div key={key} className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-2">{key.replace(/_/g, ' ')}</label>
                    <div className="flex gap-4">
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#00f2ff] outline-none transition-all" value={appSettings?.[key] || ''} onChange={(e) => update(ref(db, 'app_settings'), { [key]: e.target.value })} />
                      <input type="color" className="w-12 h-12 bg-transparent border-none cursor-pointer" value={appSettings?.[key] || '#000000'} onChange={(e) => update(ref(db, 'app_settings'), { [key]: e.target.value })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
