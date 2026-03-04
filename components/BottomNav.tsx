
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bot, Crown, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const links = [
    { to: '/', icon: Home, label: 'HOME' },
    { to: '/tools', icon: Bot, label: 'TOOLS' },
    { to: '/premium', icon: Crown, label: 'PREMIUM' },
    { to: '/profile', icon: User, label: 'PROFILE' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-24 border-t z-50 flex items-center justify-around px-4 transition-all duration-300" 
      style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderColor: 'var(--border-color)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center gap-1 w-20 h-16 rounded-2xl transition-all duration-300 relative ${isActive ? 'text-[var(--accent-color)]' : 'text-[var(--text-secondary)]'}`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? 'bg-[var(--accent-color)]/10' : ''}`}>
                <Icon 
                  size={24} 
                  className={isActive ? 'drop-shadow-[0_0_8px_var(--accent-color)]' : 'opacity-60'} 
                  style={isActive ? { color: 'var(--accent-color)' } : {}}
                />
              </div>
              <span className={`text-[9px] font-black tracking-widest transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {label}
              </span>
              {isActive && (
                <div 
                  className="absolute -bottom-1 w-8 h-[2px] rounded-full shadow-[0_0_10px_var(--accent-color)]" 
                  style={{ backgroundColor: 'var(--accent-color)' }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
