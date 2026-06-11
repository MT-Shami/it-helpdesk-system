import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        fetchRecent();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/Notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch { }
    };

    const fetchRecent = async () => {
        try {
            const res = await api.get('/Notifications/recent');
            setNotifications(res.data);
        } catch { }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/Notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await api.put('/Notifications/mark-all-read');
            setNotifications([]);
            setUnreadCount(0);
        } catch { }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 text-center">No new notifications</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        {n.relatedTicketId ? (
                                            <Link
                                                to={`/tickets/${n.relatedTicketId}`}
                                                className="text-sm text-gray-800 hover:text-blue-600 block"
                                                onClick={() => { setOpen(false); markAsRead(n.id); }}
                                            >
                                                {n.message}
                                            </Link>
                                        ) : (
                                            <p className="text-sm text-gray-800">{n.message}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        className="text-xs text-blue-600 hover:underline ml-2 whitespace-nowrap"
                                    >
                                        Mark read
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
