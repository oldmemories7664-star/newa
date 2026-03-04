
import React, { useState, useEffect } from 'react';
import { UserProfile, SavedChat } from '../types';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../firebase';
import { 
  Keyboard, 
  Code2, 
  UserCog, 
  Laptop, 
  Infinity, 
  Lock,
  Play,
  Trash2,
  X,
  Zap,
  ChevronRight
} from 'lucide-react';

interface HomeProps {
  user: UserProfile | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);

  useEffect(() => {
    if (user) {
      const chatRef = ref(db, `users/${user.uid}/chats`);
      const unsubscribe = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val
          })).sort((a, b) => b.timestamp - a.timestamp);
          setSavedChats(list);
        } else {
          setSavedChats([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleStatClick = (type: 'remaining' | 'status') => {
    navigate('/premium');
  };

  const deleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation?")) {
      remove(ref(db, `users/${user?.uid}/chats/${chatId}`));
    }
  };

  const resumeChat = (chat: SavedChat) => {
    navigate(`/chat/${chat.agentId}?chatId=${chat.id}`);
  };

  const tools = [
    { 
      id: 'prompt-gen', 
      name: 'PROMPT GENE...', 
      sub: 'LOGIC ARCHITECT', 
      icon: Keyboard, 
      color: 'bg-gradient-to-br from-[#00ffd5] to-[#008cff]',
      premium: false 
    },
    { 
      id: 'html-gen', 
      name: 'HTML GENERA...', 
      sub: 'FULL STACK AI', 
      icon: Code2, 
      color: 'bg-gradient-to-br from-[#008cff] to-[#8000ff]',
      premium: false 
    },
    { 
      id: 'pro-ai', 
      name: 'CUSTOM PRO AI', 
      sub: '2X SMART APP BILDER', 
      icon: UserCog, 
      color: 'bg-gradient-to-br from-[#8000ff] to-[#ff00c8]',
      premium: true 
    },
    { 
      id: 'pro-dev', 
      name: 'PRO AI DEVELO...', 
      sub: 'SYSTEM ARCHITECT', 
      icon: Laptop, 
      color: 'bg-gradient-to-br from-[#ff00c8] to-[#ff8c00]',
      premium: true 
    },
  ];

  const StatCard = ({ children, onClick, label }: any) => (
    <div 
      onClick={onClick}
      className="rounded-[25px] p-6 flex flex-col items-center justify-center border transition-all cursor-pointer active:scale-95 h-32"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <div style={{ color: 'var(--text-primary)' }}>{children}</div>
      <span className="text-[10px] font-black tracking-widest mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{label}</span>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      <div className="mb-8 mt-4">
        <h2 className="text-4xl font-black mb-1 tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>WELCOME {user?.username || 'ARCHITECT'}!</h2>
        <p style={{ color: 'var(--text-secondary)' }} className="font-medium">Build modern logic with Studio AI</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-12">
        <StatCard onClick={() => setShowHistoryModal(true)} label="PROJECTS">
          <span className="text-3xl font-black">{savedChats.length}</span>
        </StatCard>
        
        <StatCard onClick={() => handleStatClick('remaining')} label={user?.is_premium ? 'UNLIMITED' : 'REMAINING'}>
          {user?.is_premium ? (
            <Infinity size={32} className="text-[#00f2ff]" />
          ) : (
            <span className="text-2xl font-black">
              {Math.floor((user?.remaining_ai_seconds || 0) / 60)}M
            </span>
          )}
        </StatCard>

        <StatCard onClick={() => handleStatClick('status')} label="STATUS">
          <span className={`text-xl font-black ${user?.is_premium ? 'text-pink-500' : 'text-[#00ffd5]'}`}>
            {user?.is_premium ? 'PRO' : 'FREE'}
          </span>
        </StatCard>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-xs font-black tracking-[0.2em] whitespace-nowrap uppercase" style={{ color: 'var(--accent-color)' }}>
          Launch AI Workspace
        </h3>
        <div className="h-[1px] w-full" style={{ backgroundColor: 'var(--border-color)', opacity: 0.3 }}></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div 
            key={tool.id} 
            onClick={() => {
              if (tool.premium && !user?.is_premium) {
                navigate('/premium');
              } else {
                navigate(`/chat/${tool.id}`);
              }
            }}
            className="group relative overflow-hidden rounded-[45px] border transition-all cursor-pointer aspect-square flex flex-col items-center justify-center text-center p-4"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className={`w-20 h-20 rounded-[28px] ${tool.color} flex items-center justify-center mb-4 shadow-xl shadow-black/40 group-hover:scale-110 transition-transform duration-500`}>
              <tool.icon size={36} className="text-white" />
            </div>

            <div className="relative z-10">
              <h4 className="text-[13px] font-black tracking-tight mb-1 uppercase" style={{ color: 'var(--text-primary)' }}>
                {tool.name}
              </h4>
              <p className="text-[9px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                {tool.sub}
              </p>
            </div>

            {tool.premium && !user?.is_premium && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px] flex flex-col items-center justify-center">
                <div className="bg-[#ff00c8] text-white px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1">
                  <Lock size={10} /> PRO
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex flex-col animate-in slide-in-from-bottom duration-500" style={{ backgroundColor: 'var(--primary-bg)' }}>
          <div className="h-20 flex items-center justify-between px-6 border-b transition-colors" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>PROJECT HISTORY</h2>
            <button onClick={() => setShowHistoryModal(false)} className="p-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {savedChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
                <Code2 size={64} className="mb-4 mx-auto" style={{ color: 'var(--text-primary)' }} />
                <p className="font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>No active projects found</p>
              </div>
            ) : (
              savedChats.map((chat) => (
                <div 
                  key={chat.id}
                  className="p-5 rounded-[30px] border flex items-center justify-between group transition-all"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>{chat.agentName}</span>
                      <span className="text-[8px]" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>• {new Date(chat.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold truncate text-sm" style={{ color: 'var(--text-primary)' }}>{chat.lastMessage || 'Empty Conversation'}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => resumeChat(chat)}
                      className="p-3 bg-[#00f2ff] text-black rounded-xl hover:scale-110 transition-transform"
                    >
                      <Play size={18} fill="currentColor" />
                    </button>
                    <button 
                      onClick={(e) => deleteChat(e, chat.id)}
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
