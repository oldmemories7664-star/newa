
import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase';
import { AppNotification } from '../types';
// Fixed: Added missing ShieldCheck and Bell icons to imports
import { X, CheckCircle, Info, AlertTriangle, Clock, ShieldCheck, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  uid?: string;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ uid, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const notifRef = ref(db, 'notifications');
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data)
          .map(([id, val]: [string, any]) => ({ id, ...val }))
          .filter(n => !n.related_uid || n.related_uid === uid)
          .sort((a, b) => b.created_at - a.created_at);
        setNotifications(list);
      }
    });
    return () => unsubscribe();
  }, [uid]);

  const markAsRead = (id: string) => {
    update(ref(db, `notifications/${id}`), { is_read: true });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'signup': return <CheckCircle className="text-[#00ff9d]" size={20} />;
      case 'premium_request': return <Clock className="text-[#00f2ff]" size={20} />;
      case 'premium_approval': return <ShieldCheck className="text-[#00ff9d]" size={20} />;
      default: return <Info className="text-[#ff00c8]" size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="w-full max-w-sm glass h-full border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Notifications
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="bg-[#ff00c8] text-white text-[10px] px-2 py-0.5 rounded-full">
                {notifications.filter(n => !n.is_read).length} New
              </span>
            )}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <Bell size={48} className="mb-4" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => markAsRead(notif.id)}
                className={`p-4 rounded-2xl glass border transition-all cursor-pointer ${notif.is_read ? 'opacity-60 border-white/5' : 'border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]'}`}
              >
                <div className="flex gap-3">
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm mb-1">{notif.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-2">{notif.message}</p>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                      {formatDistanceToNow(notif.created_at)} ago
                    </span>
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[#ff00c8]" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
