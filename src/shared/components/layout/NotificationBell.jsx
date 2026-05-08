import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle, FiXCircle, FiClock, FiTrash2 } from "react-icons/fi";
import { getMyNotifications, markAsRead, markAllAsRead } from "../../../features/notifications/services/notificationsApi";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

import { useSocket } from "../../../contexts/SocketContext";
import toast from "react-hot-toast";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);
    const socket = useSocket();

    const fetchNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time notifications via socket
        if (socket) {
            socket.on('new_notification', (newNotif) => {
                console.log("New real-time notification received:", newNotif);

                // Show toast for immediate visibility
                toast(newNotif.title, {
                    icon: '📩',
                    duration: 5000,
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });

                fetchNotifications(); // Refresh list immediately
            });

            // Global dashboard sync alerts
            socket.on('request_sync', (data) => {
                toast.info(`Update: New ${data.type.replace(/_/g, ' ')} received`, {
                    icon: '🔔',
                    duration: 6000
                });
            });
        }

        // Poll for new notifications every 60 seconds (fallback)
        const interval = setInterval(fetchNotifications, 60000);

        return () => {
            if (socket) {
                socket.off('new_notification');
                socket.off('request_sync');
            }
            clearInterval(interval);
        };
    }, [socket]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FiCheckCircle className="text-green-500" />;
            case 'warning': return <FiAlertCircle className="text-amber-500" />;
            case 'error': return <FiXCircle className="text-red-500" />;
            default: return <FiInfo className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl transition-all duration-200 hover:bg-slate-100 relative text-slate-600 group active:scale-95"
            >
                <FiBell className={`text-xl transition-colors ${isOpen ? 'text-blue-600' : 'group-hover:text-blue-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right ring-1 ring-black/5"
                >
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Notifications</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                {unreadCount} UNREAD MESSAGES
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tight flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full transition-colors"
                            >
                                <FiCheckCircle /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                                        className={`group p-5 hover:bg-slate-50 transition-all cursor-pointer flex gap-4 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg bg-white shadow-sm border border-slate-100`}>
                                                {getIcon(n.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-black text-slate-800 leading-tight ${!n.isRead ? 'pr-2' : ''}`}>
                                                    {n.title}
                                                </h4>
                                                {!n.isRead && (
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 italic">
                                                "{n.message}"
                                            </p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                                                    <FiClock className="text-xs" />
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </span>
                                                {n.link && (
                                                    <Link
                                                        to={n.link}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-[10px] font-black text-blue-500 hover:text-blue-600 underline uppercase tracking-tight"
                                                    >
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <FiBell className="text-3xl" />
                                </div>
                                <h4 className="text-sm font-black text-slate-800">No notifications yet</h4>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">You're all caught up!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button className="text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                            View Notification Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
