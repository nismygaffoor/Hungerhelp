import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 30000;

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get('/notifications/');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user) return undefined;

        const intervalId = window.setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => window.clearInterval(intervalId);
    }, [user, fetchNotifications]);

    const markRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setNotifications((prev) =>
                prev.map((item) =>
                    item._id === notificationId ? { ...item, read: true } : item
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications as read', err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        refresh: fetchNotifications,
        markRead,
        markAllRead,
    };
};

export const getNotificationText = (notification, t) => {
    const key = `notifications.types.${notification.type}`;
    return {
        title: t(`${key}.title`, notification.params || {}),
        message: t(`${key}.message`, notification.params || {}),
    };
};

export const formatNotificationTime = (dateStr, t) => {
    if (!dateStr) return t('notifications.justNow');
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return t('notifications.daysAgo', { count: days });
    if (hours > 0) return t('notifications.hoursAgo', { count: hours });
    if (minutes > 0) return t('notifications.minsAgo', { count: minutes });
    return t('notifications.justNow');
};
