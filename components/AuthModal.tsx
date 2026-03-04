
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { ref, set, push } from 'firebase/database';
import { auth, db } from '../firebase';
import { X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  persistent?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, persistent }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Initialize user data in RTDB
        await set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          username: username || email.split('@')[0],
          email: email,
          is_premium: false,
          premium_expiry_timestamp: 0,
          remaining_ai_seconds: 600,
          total_usage_time: 0,
          created_at: Date.now(),
          last_login: Date.now(),
          theme_preferences: {
            accent_color: '#00f2ff',
            card_color: 'rgba(255, 255, 255, 0.05)'
          },
          ads_disabled: false,
          blocked: false
        });

        // Create notification
        const notifRef = push(ref(db, 'notifications'));
        await set(notifRef, {
          title: 'Welcome to AI Studio!',
          message: 'You have been awarded 600 seconds of free AI time.',
          type: 'signup',
          related_uid: user.uid,
          is_read: false,
          created_at: Date.now(),
          priority: 'medium'
        });

        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="glass p-8 rounded-[40px] w-full max-w-md border border-white/20 relative shadow-[0_0_50px_rgba(0,242,255,0.2)]">
        {!persistent && (
          <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white">
            <X size={24} />
          </button>
        )}

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-2 border-b-2 transition-all font-bold ${isLogin ? 'border-[#00f2ff] text-[#00f2ff]' : 'border-transparent text-white/40'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-2 border-b-2 transition-all font-bold ${!isLogin ? 'border-[#ff00c8] text-[#ff00c8]' : 'border-transparent text-white/40'}`}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-[#00f2ff] to-[#ff00c8] bg-clip-text text-transparent">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-6 text-sm border border-red-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Username" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#00f2ff] transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#00f2ff] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#00f2ff] transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-black transition-all transform active:scale-95 ${isLogin ? 'bg-[#00f2ff] hover:neon-glow' : 'bg-[#ff00c8] shadow-[0_0_20px_rgba(255,0,200,0.4)]'}`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Join AI Studio'}
          </button>
        </form>

        <p className="mt-8 text-center text-white/40 text-sm">
          By joining, you agree to our <span className="text-[#00f2ff] underline cursor-pointer">Terms</span> and <span className="text-[#00f2ff] underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
