
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Keyboard, 
  Code2, 
  UserCog, 
  Laptop, 
  Search, 
  Grid,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { useEffect, useState } from 'react';

interface ToolsProps {
  user: UserProfile | null;
}

const Tools: React.FC<ToolsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const tools = [
    { 
      id: 'prompt-gen', 
      name: 'PROMPT GENE...', 
      sub: 'LOGIC ARCHITECT', 
      icon: Keyboard, 
      color: 'bg-gradient-to-br from-[#00ffd5] to-[#008cff]',
      premium: false,
      desc: 'Expert at engineering complex AI instructions for better results.'
    },
    { 
      id: 'html-gen', 
      name: 'HTML GENERA...', 
      sub: 'FULL STACK AI', 
      icon: Code2, 
      color: 'bg-gradient-to-br from-[#008cff] to-[#8000ff]',
      premium: false,
      desc: 'Generates production-ready code with instant run capabilities.'
    },
    { 
      id: 'pro-ai', 
      name: 'CUSTOM PRO AI', 
      sub: '2X SMART APP BILDER', 
      icon: UserCog, 
      color: 'bg-gradient-to-br from-[#8000ff] to-[#ff00c8]',
      premium: true,
      desc: 'High-intelligence reasoning engine for architectural decisions.'
    },
    { 
      id: 'pro-dev', 
      name: 'PRO AI DEVELO...', 
      sub: 'SYSTEM ARCHITECT', 
      icon: Laptop, 
      color: 'bg-gradient-to-br from-[#ff00c8] to-[#ff8c00]',
      premium: true,
      desc: 'Advanced code generation and system analysis tools.'
    },
  ];

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.sub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToolClick = (tool: any) => {
    if (tool.premium && !user?.is_premium) {
      navigate('/premium');
    } else {
      navigate(`/chat/${tool.id}`);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <Grid className="text-[#00f2ff]" />
          NEURAL INVENTORY
        </h2>
        <div className="w-full md:w-96 glass rounded-2xl flex items-center px-4 border border-white/10 focus-within:border-[#00f2ff]/50 transition-all">
          <Search size={18} className="text-white/30" />
          <input 
            placeholder="Filter agents..." 
            className="w-full bg-transparent border-none p-4 outline-none text-sm uppercase font-bold tracking-widest text-white placeholder-white/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Daily Limit Info (For Free Users) */}
      {!user?.is_premium && (
        <div className="mb-8 glass border-l-4 border-l-[#ff00c8] p-4 rounded-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-[#ff00c8]" />
            <p className="text-[11px] font-black tracking-widest uppercase">
              Free Access: 10 Minutes Daily Active Processing Time
            </p>
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTools.map((tool) => (
          <div 
            key={tool.id} 
            onClick={() => handleToolClick(tool)}
            className="group relative overflow-hidden rounded-[40px] glass border border-white/5 hover:border-[#00f2ff]/20 transition-all cursor-pointer p-6 flex items-center gap-6"
          >
            {/* Tool Icon */}
            <div className={`w-20 h-20 shrink-0 rounded-[28px] ${tool.color} flex items-center justify-center shadow-xl shadow-black/40 group-hover:scale-105 transition-transform duration-500`}>
              <tool.icon size={36} className="text-white" />
            </div>

            {/* Tool Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">{tool.sub}</span>
                {tool.premium && (
                  <span className="bg-[#ff00c8]/20 text-[#ff00c8] text-[8px] font-black px-2 py-0.5 rounded-full border border-[#ff00c8]/30">PRO</span>
                )}
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2 uppercase group-hover:text-[#00f2ff] transition-colors truncate">
                {tool.name}
              </h3>
              <p className="text-[11px] text-white/40 font-medium leading-relaxed line-clamp-2">
                {tool.desc}
              </p>
            </div>

            {/* Locked Overlay for Premium Tools */}
            {tool.premium && !user?.is_premium && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] flex items-center justify-end pr-8">
                <div className="bg-[#ff00c8] text-white p-4 rounded-2xl shadow-lg shadow-[#ff00c8]/20">
                  <Lock size={24} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-20 opacity-20">
          <Search size={64} className="mx-auto mb-4" />
          <p className="text-lg font-black uppercase">No Matching Agents</p>
        </div>
      )}
    </div>
  );
};

export default Tools;
