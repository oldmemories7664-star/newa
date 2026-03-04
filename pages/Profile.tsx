
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Palette, 
  MessageCircle, 
  ShieldCheck, 
  FileText, 
  Flame, 
  Cloud,
  ChevronRight,
  RefreshCw,
  X,
  Sparkles,
  Camera,
  Upload,
  Lock
} from 'lucide-react';

interface ProfileProps {
  user: UserProfile | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const defaultTheme = {
    primary_bg: '#070312',
    secondary_bg: '#100821',
    card_bg: '#0a051a',
    border_color: '#321D5C',
    text_primary: '#FFFFFF',
    text_secondary: '#B3ADD1',
    accent_color: '#00F2FF',
    button_bg: '#00F2FF',
    success: '#00FF9D',
    danger: '#FF0055',
    warning: '#FFCC00',
  };

  const [theme, setTheme] = useState(user?.theme_preferences || defaultTheme);

  useEffect(() => {
    if (user?.theme_preferences) {
      setTheme({ ...defaultTheme, ...user.theme_preferences });
    }
  }, [user?.theme_preferences]);

  const handleLogout = () => {
    signOut(auth);
  };

  const openWhatsApp = () => {
    if (!user?.is_premium) {
      navigate('/premium');
      return;
    }
    window.open('https://wa.me/919358197207', '_blank');
  };

  const updateThemeValue = (key: string, value: string) => {
    if (!user?.is_premium) return;
    
    // 1. Update local state for immediate response
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);
    
    // 2. Inject into DOM immediately
    document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value);
    
    // 3. Sync with Firebase
    if (user) {
      update(ref(db, `users/${user.uid}/theme_preferences`), {
        [key]: value
      });
    }
  };

  const handleImageClick = () => {
    if (!user?.is_premium) {
      navigate('/premium');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !user.is_premium) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size too large. Please select an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      update(ref(db, `users/${user.uid}`), {
        profile_image_base64: base64String
      }).then(() => {
        alert("Profile picture updated successfully!");
      }).catch((err) => {
        console.error("Error updating profile picture:", err);
        alert("Failed to update profile picture.");
      });
    };
    reader.readAsDataURL(file);
  };

  const resetTheme = () => {
    if (!user?.is_premium) {
      navigate('/premium');
      return;
    }
    setTheme(defaultTheme);
    Object.keys(defaultTheme).forEach(key => {
      document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, defaultTheme[key as keyof typeof defaultTheme]);
    });
    if (user) {
      update(ref(db, `users/${user.uid}/theme_preferences`), defaultTheme);
    }
  };

  const protocols = {
    privacy: {
      title: "PRIVACY PROTOCOL",
      content: "Alpha AI enforces a strict zero-knowledge architecture. All neural processing of your data occurs in isolated, ephemeral environments. We do not store, train on, or monetize your creative outputs. Your digital footprint within our ecosystem is obfuscated and encrypted using industry-standard AES-256 protocols. Your logic is your own."
    },
    terms: {
      title: "TERMS & CONDITIONS",
      content: "By accessing the Alpha AI Studio, you agree to utilize our neural assets for ethical development. Prohibited actions include: reverse-engineering core models, attempting to breach cloud firewalls, or utilizing outputs for malicious automation. Subscription licenses are non-transferable and are tied to your unique identity verification key."
    },
    fire: {
      title: "FIRE PROTOCOL",
      content: "Alpha AI Fire Protocol is our proprietary active defense system. It monitors for anomalous patterns and brute-force attempts. In the event of a security breach, all sessions are immediately terminated, and cloud-stored assets are migrated to cold-storage vaults. This ensures the integrity of your development environment remains absolute under any threat level."
    }
  };

  const renderColorInput = (label: string, key: string) => {
    const currentColor = theme[key as keyof typeof theme] || defaultTheme[key as keyof typeof defaultTheme] || '#000000';
    const isLocked = !user?.is_premium;

    return (
      <div key={key} className="space-y-3 relative">
        <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <div 
          className={`relative h-16 rounded-2xl border flex items-center px-4 overflow-hidden group transition-all ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:brightness-125 cursor-pointer'}`} 
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-color)' }}
        >
          {!isLocked && (
            <input 
              type="color" 
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              value={currentColor}
              onChange={(e) => updateThemeValue(key, e.target.value)}
            />
          )}
          <span className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
            {isLocked ? '••••••' : currentColor.toUpperCase()}
          </span>
          <div 
            className="ml-auto w-10 h-10 rounded-xl border border-white/10 shadow-lg flex items-center justify-center" 
            style={{ backgroundColor: isLocked ? '#333' : currentColor }}
          >
            {isLocked && <Lock size={14} className="text-white/40" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="mb-10 px-2">
        <h2 className="text-4xl font-black mb-1 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>DEV STUDIO PROFILE</h2>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>IDENTITY VERIFICATION 1.0.4</p>
      </div>

      <div className="rounded-[50px] border p-10 mb-12 relative overflow-hidden flex flex-col items-center md:flex-row md:items-center gap-10" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[100px] pointer-events-none"></div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <div 
          onClick={handleImageClick}
          className="w-44 h-44 rounded-[45px] p-1 shadow-2xl shadow-black/40 cursor-pointer relative group" 
          style={{ background: 'linear-gradient(to bottom right, var(--accent-color), var(--danger))' }}
        >
           <div className="w-full h-full rounded-[42px] flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: 'var(--card-bg)' }}>
             {user?.profile_image_base64 ? (
               <img src={user.profile_image_base64} alt="P" className="w-full h-full object-cover" />
             ) : (
               <span className="text-7xl font-black italic" style={{ color: 'var(--text-primary)' }}>{user?.username?.[0]?.toUpperCase() || 'W'}</span>
             )}

             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {user?.is_premium ? (
                  <>
                    <Camera size={32} className="text-white mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">UPDATE LOGO</span>
                  </>
                ) : (
                  <>
                    <Lock size={32} className="text-white mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">PRO ONLY</span>
                  </>
                )}
             </div>
           </div>
           
           <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl border-2 border-[var(--card-bg)]" style={{ backgroundColor: user?.is_premium ? 'var(--accent-color)' : '#ff00c8', color: user?.is_premium ? 'black' : 'white' }}>
              {user?.is_premium ? <Upload size={18} /> : <Lock size={18} />}
           </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h3 className="text-4xl font-black mb-1 italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>{user?.username?.toUpperCase() || 'W'}</h3>
          <p className="text-[11px] font-black tracking-widest uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>{user?.email?.toUpperCase() || 'W@GMAIL.COM'}</p>
          
          <div className="inline-block px-8 py-3 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', backgroundColor: 'rgba(255, 0, 85, 0.05)', opacity: 0.8 }}>
             {user?.is_premium ? 'BASIC PRO LITE' : 'FREE ARCHITECT'}
          </div>
        </div>
      </div>

      <div className="mb-12 relative">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-black tracking-[0.3em] uppercase" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>STUDIO THEME ENGINE</h3>
            {!user?.is_premium && (
              <span className="flex items-center gap-1 bg-pink-500/10 text-pink-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-pink-500/20">
                <Lock size={8} /> PRO FEATURE
              </span>
            )}
          </div>
          <button 
            onClick={resetTheme}
            className={`flex items-center gap-2 px-6 py-2 rounded-full border text-[9px] font-black tracking-widest transition-all ${!user?.is_premium ? 'opacity-30 cursor-not-allowed' : 'hover:brightness-125'}`}
            style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
          >
            <RefreshCw size={12} /> RESET DEFAULT
          </button>
        </div>

        <div className="relative rounded-[50px] border p-10 space-y-12 shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          {!user?.is_premium && (
            <div 
              onClick={() => navigate('/premium')}
              className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[6px] flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="bg-pink-500 p-6 rounded-[35px] shadow-[0_0_30px_rgba(255,0,200,0.5)] group-hover:scale-110 transition-transform mb-4">
                <Lock size={40} className="text-white" />
              </div>
              <p className="text-xl font-black text-white tracking-widest uppercase">UNLOCK THEME ENGINE</p>
              <p className="text-[10px] font-bold text-white/50 tracking-[0.3em] uppercase mt-2">PREMIUM MEMBERSHIP REQUIRED</p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-black tracking-widest uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>BACKGROUNDS & CARDS</p>
            <div className="grid grid-cols-2 gap-6">
              {renderColorInput('PRIMARY BG', 'primary_bg')}
              {renderColorInput('SECONDARY BG', 'secondary_bg')}
              {renderColorInput('CARD BG', 'card_bg')}
              {renderColorInput('BORDER COLOR', 'border_color')}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>TYPOGRAPHY</p>
            <div className="grid grid-cols-2 gap-6">
              {renderColorInput('TEXT PRIMARY', 'text_primary')}
              {renderColorInput('TEXT SECONDARY', 'text_secondary')}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>ACCENTS & BUTTONS</p>
            <div className="grid grid-cols-2 gap-6">
              {renderColorInput('ACCENT COLOR', 'accent_color')}
              {renderColorInput('BUTTON BG', 'button_bg')}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase mb-6" style={{ color: 'var(--text-secondary)' }}>STATUS COLORS</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {renderColorInput('SUCCESS', 'success')}
              {renderColorInput('DANGER', 'danger')}
              {renderColorInput('WARNING', 'warning')}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <button 
          onClick={openWhatsApp}
          className={`w-full border transition-all rounded-[35px] p-8 flex items-center justify-between group relative overflow-hidden ${!user?.is_premium ? 'cursor-pointer' : ''}`}
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: user?.is_premium ? 'rgba(var(--accent-color), 0.1)' : 'rgba(255,0,200,0.1)', color: user?.is_premium ? 'var(--accent-color)' : '#ff00c8' }}>
               <MessageCircle size={32} />
             </div>
             <div className="text-left">
               <h4 className={`text-lg font-black tracking-tight uppercase transition-colors ${user?.is_premium ? 'group-hover:text-[var(--accent-color)]' : ''}`}>WHATSAPP SUPPORT</h4>
               <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                 {user?.is_premium ? '9358197207' : 'PREMIUM ACCESS ONLY'}
               </p>
             </div>
          </div>
          {user?.is_premium ? (
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <div className="bg-pink-500/10 text-pink-500 p-3 rounded-2xl border border-pink-500/20">
              <Lock size={20} />
            </div>
          )}
        </button>

        <button 
          onClick={() => setActiveProtocol('privacy')}
          className="w-full border transition-all rounded-[35px] p-8 flex items-center justify-between group"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
               <ShieldCheck size={32} />
             </div>
             <div className="text-left">
               <h4 className="text-lg font-black tracking-tight uppercase group-hover:text-[var(--accent-color)] transition-colors">PRIVACY PROTOCOL</h4>
             </div>
          </div>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-secondary)' }} />
        </button>

        <button 
          onClick={() => setActiveProtocol('terms')}
          className="w-full border transition-all rounded-[35px] p-8 flex items-center justify-between group"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
               <FileText size={32} />
             </div>
             <div className="text-left">
               <h4 className="text-lg font-black tracking-tight uppercase group-hover:text-[var(--accent-color)] transition-colors">TERMS & CONDITIONS</h4>
             </div>
          </div>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-secondary)' }} />
        </button>

        <button 
          onClick={() => setActiveProtocol('fire')}
          className="w-full border transition-all rounded-[35px] p-8 flex items-center justify-between group"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 85, 0, 0.1)', color: '#FF5500' }}>
               <Flame size={32} />
             </div>
             <div className="text-left">
               <h4 className="text-lg font-black tracking-tight uppercase group-hover:text-[var(--accent-color)] transition-colors">FIRE PROTOCOL</h4>
             </div>
          </div>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      <div className="border rounded-[35px] p-8 mb-12" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[11px] font-black tracking-widest uppercase flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Cloud size={14} /> CLOUD USAGE
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>
            {user?.is_premium ? 'UNLIMITED' : `${Math.floor((user?.remaining_ai_seconds || 0) / 60)}M REMAINING`}
          </span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,242,255,0.4)]"
            style={{ 
              width: user?.is_premium ? '100%' : `${(user?.remaining_ai_seconds || 0) / 600 * 100}%`,
              background: 'linear-gradient(to right, var(--accent-color), var(--danger))'
            }}
          />
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full border py-8 rounded-[35px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-[var(--danger)] hover:text-white transition-all active:scale-95"
        style={{ backgroundColor: 'rgba(255,0,85,0.05)', borderColor: 'rgba(255,0,85,0.2)', color: 'var(--danger)' }}
      >
        <LogOut size={24} /> LOGOFF DEVELOPER
      </button>

      {activeProtocol && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-6">
          <div className="glass p-10 rounded-[50px] w-full max-w-2xl border relative animate-in zoom-in duration-300" style={{ borderColor: 'var(--border-color)' }}>
            <button onClick={() => setActiveProtocol(null)} className="absolute top-8 right-8 hover:brightness-125 transition-all" style={{ color: 'var(--text-secondary)' }}>
              <X size={28} />
            </button>
            <h3 className="text-3xl font-black mb-6 italic tracking-tight" style={{ color: 'var(--accent-color)' }}>
              {protocols[activeProtocol as keyof typeof protocols].title}
            </h3>
            <div className="h-[1px] w-32 mb-8" style={{ backgroundColor: 'var(--accent-color)' }}></div>
            <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
              {protocols[activeProtocol as keyof typeof protocols].content}
            </p>
            <button 
              onClick={() => setActiveProtocol(null)}
              className="mt-12 w-full py-5 rounded-[25px] border font-black text-[11px] tracking-widest uppercase hover:bg-white/5 transition-all"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
