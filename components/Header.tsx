
import React, { useState, useEffect } from 'react';
import { UserProfile, AppSettings } from '../types';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Menu, Bell, ShieldCheck, X, Zap, Sun, Moon, ArrowLeft, ShieldAlert, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { broadcastNotification } from '../notificationService';

interface HeaderProps {
  user: UserProfile | null;
  appSettings: AppSettings | null;
  onNotify: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, appSettings, onNotify, isDarkMode, toggleTheme }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAdminPassModal, setShowAdminPassModal] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const notifRef = ref(db, 'notifications');
      onValue(notifRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const count = Object.values(data).filter((n: any) => !n.is_read && (n.related_uid === user.uid || !n.related_uid)).length;
          setUnreadCount(count);
        }
      });
    }
  }, [user]);

  const handleAdminAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPass === '&9358197207&') {
      setError('');
      sessionStorage.setItem('admin_session', 'true');
      
      // Broadcast notification
      broadcastNotification(
        'Admin Alert',
        `${user?.username || 'An admin'} has accessed the Neural Core Dashboard.`,
        user?.uid
      );

      setShowAdminPassModal(false);
      setAdminPass('');
      navigate('/admin');
    } else {
      setError('ACCESS DENIED: INCORRECT MASTER KEY');
      setAdminPass('');
      if (window.navigator.vibrate) window.navigator.vibrate(200);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center justify-between px-6 border-b transition-all duration-300" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-4">
          <div className="relative" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            {appSettings?.app_logo_url ? (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={appSettings.app_logo_url} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#8000ff] to-[#00f2ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#8000ff]/20">
                <Zap size={24} className="text-white fill-current" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-1">
              <span style={{ color: 'var(--text-primary)' }}>{appSettings?.app_name?.split(' ')[0] || 'ALPHA'}</span>
              <span className="bg-gradient-to-r from-[#00f2ff] to-[#8000ff] bg-clip-text text-transparent">
                {appSettings?.app_name?.split(' ')[1] || 'AI'}
              </span>
            </h1>
            <div className="flex items-center gap-1.5 px-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] shadow-[0_0_5px_#00ff9d] animate-pulse"></div>
               <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#00ff9d]/70">Neural Link Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={toggleTheme} 
            className="p-3 transition-all rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center" 
            style={{ color: 'var(--text-secondary)' }}
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          <button onClick={onNotify} className="p-3 transition-colors relative rounded-full hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            <Bell size={22} />
            {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 bg-red-500 w-2 h-2 rounded-full border border-current"></span>}
          </button>
          
          <button onClick={() => setShowAdminPassModal(true)} className="p-3 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            <Menu size={26} />
          </button>
        </div>
      </header>

      {showAdminPassModal && (
        <div className="fixed inset-0 z-[9999] bg-[#070312]/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <button 
            onClick={() => { setShowAdminPassModal(false); setError(''); setAdminPass(''); }}
            className="absolute top-10 left-6 flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-black text-[10px] tracking-widest uppercase shadow-2xl"
          >
            <ArrowLeft size={16} /> BACK TO STUDIO
          </button>

          <div className={`w-full max-w-md bg-[#0a051a] p-10 rounded-[50px] border transition-all duration-300 ${error ? 'border-red-500/50' : 'border-white/10'} relative animate-in zoom-in-95`}>
            <div className="flex flex-col items-center mb-10">
              <div className={`w-20 h-20 rounded-[35px] flex items-center justify-center mb-6 border ${error ? 'bg-red-500/10 border-red-500/30' : 'bg-[#00f2ff]/10 border-[#00f2ff]/20'}`}>
                {error ? <ShieldAlert size={40} className="text-red-500" /> : <ShieldCheck size={40} className="text-[#00f2ff]" />}
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase text-center leading-none">
                ADMIN <br/><span className={error ? 'text-red-500' : 'text-[#00f2ff]'}>ACCESS</span>
              </h2>
            </div>
            
            <form onSubmit={handleAdminAuth} className="space-y-6">
              <input 
                type="password" 
                placeholder="MASTER PASS KEY" 
                className={`w-full bg-black/40 border rounded-3xl p-6 text-white focus:outline-none font-mono text-center tracking-[0.6em] text-2xl transition-all ${error ? 'border-red-500/50' : 'border-white/5 focus:border-[#00f2ff]'}`}
                value={adminPass}
                onChange={(e) => { setAdminPass(e.target.value); if(error) setError(''); }}
                autoFocus
              />
              <button 
                type="submit"
                className="w-full font-black py-6 rounded-3xl bg-gradient-to-r from-[#00f2ff] to-[#8000ff] text-white uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-500/20"
              >
                Launch Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
