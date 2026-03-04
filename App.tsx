
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, update, onChildAdded, query, orderByChild, startAt } from 'firebase/database';
import { auth, db } from './firebase';
import { UserProfile, AppSettings } from './types';
import { requestNotificationPermission, showLocalNotification } from './notificationService';

// Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import NotificationPanel from './components/NotificationPanel';
import MaintenanceScreen from './components/MaintenanceScreen';

// Pages
import Home from './pages/Home';
import Tools from './pages/Tools';
import Premium from './pages/Premium';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Chat from './pages/Chat';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? false : true;
  });
  const location = useLocation();

  const isAdmin = useMemo(() => {
    const sessionActive = sessionStorage.getItem('admin_session') === 'true';
    return (
      userProfile?.email === 'admin@aistudio.com' || 
      userProfile?.isAdmin || 
      sessionActive
    );
  }, [userProfile, location.pathname]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    const root = document.documentElement;
    if (newMode) root.classList.add('dark');
    else root.classList.remove('dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');

    const injectVars = (themeObj: any) => {
      if (!themeObj) return;
      Object.keys(themeObj).forEach(key => {
        const value = themeObj[key];
        if (typeof value === 'string' && value.startsWith('#')) {
          const cssVarName = `--${key.replace(/_/g, '-')}`;
          root.style.setProperty(cssVarName, value);
        }
      });
    };

    if (isDarkMode) {
      if (appSettings) injectVars(appSettings);
      if (userProfile?.is_premium && userProfile?.theme_preferences) {
        injectVars(userProfile.theme_preferences);
      }
    } else {
      root.removeAttribute('style');
    }
  }, [isDarkMode, appSettings, userProfile]);

  useEffect(() => {
    requestNotificationPermission();

    const startTime = Date.now();
    const broadcastRef = query(
      ref(db, 'broadcast_notifications'),
      orderByChild('timestamp'),
      startAt(startTime)
    );

    const unsubscribeBroadcast = onChildAdded(broadcastRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.senderUid !== currentUser?.uid) {
        showLocalNotification(data.title, data.message);
      }
    });

    return () => {
      unsubscribeBroadcast();
    };
  }, [currentUser]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
      }
    });

    const settingsRef = ref(db, 'app_settings');
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      setAppSettings(snapshot.val());
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const profileRef = ref(db, `users/${currentUser.uid}`);
      const unsubscribeProfile = onValue(profileRef, (snapshot) => {
        const profile = snapshot.val();
        // Handle premium expiry
        if (profile?.is_premium && profile?.premium_expiry_timestamp > 0 && profile.premium_expiry_timestamp < Date.now()) {
          update(ref(db, `users/${currentUser.uid}`), {
            is_premium: false,
            premium_expiry_timestamp: 0,
            ads_disabled: false
          });
        }
        setUserProfile(profile);
        setLoading(false);
      }, (err) => {
        console.error("Profile load error:", err);
        setLoading(false);
      });
      return () => unsubscribeProfile();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070312] gap-6">
        <div className="w-20 h-20 border-4 border-[#00f2ff] border-t-transparent rounded-[24px] animate-spin"></div>
        <p className="text-[#00f2ff] text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Establishing Secure Neural Link</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070312] flex items-center justify-center p-4">
        <AuthModal onClose={() => {}} persistent={true} />
      </div>
    );
  }

  if (appSettings?.maintenance_mode && !isAdmin) {
    return <MaintenanceScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col transition-all duration-400" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--text-primary)' }}>
      <Header 
        user={userProfile} 
        appSettings={appSettings} 
        onNotify={() => setShowNotifications(!showNotifications)} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 pb-40 px-4 max-w-7xl mx-auto w-full pt-20 flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home user={userProfile} />} />
            <Route path="/tools" element={<Tools user={userProfile} />} />
            <Route path="/premium" element={<Premium user={userProfile} />} />
            <Route path="/profile" element={<Profile user={userProfile} />} />
            <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
            <Route path="/chat/:agentId" element={<Chat user={userProfile} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      <BottomNav />

      {showNotifications && (
        <NotificationPanel 
          uid={currentUser?.uid} 
          onClose={() => setShowNotifications(false)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
