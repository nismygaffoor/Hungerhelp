import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const formatMemberSince = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
};

export const useProfile = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const [profileRes, statsRes] = await Promise.all([
                api.get('/auth/me'),
                api.get('/users/profile-stats'),
            ]);
            setProfile(profileRes.data);
            setStats(statsRes.data);
            updateUser(profileRes.data);
        } catch (err) {
            console.error('Failed to load profile', err);
            if (user) setProfile(user);
        } finally {
            setLoading(false);
        }
    }, [user, updateUser]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const startEdit = () => {
        setForm({
            name: profile?.name || '',
            contact: profile?.contact || '',
            address: profile?.address || '',
            district: profile?.district || '',
            home_address: profile?.home_address || profile?.home_no || '',
            city: profile?.city || profile?.road || '',
            language: profile?.language || 'English',
            businessName: profile?.businessName || '',
            beneficiaryType: profile?.beneficiaryType || '',
            experience: profile?.experience || '',
        });
        setEditing(true);
    };

    const cancelEdit = () => setEditing(false);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const saveProfile = async () => {
        if (form.district && !form.city) {
            alert('Please enter your city.');
            return;
        }
        setSaving(true);
        try {
            const res = await api.patch('/auth/profile', form);
            setProfile(res.data.user);
            updateUser(res.data.user);
            setEditing(false);
            alert('Profile updated successfully');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return {
        profile,
        stats,
        loading,
        saving,
        editing,
        form,
        startEdit,
        cancelEdit,
        handleChange,
        saveProfile,
        memberSince: formatMemberSince(profile?.created_at),
        initials: getInitials(profile?.name),
        refetch: fetchProfile,
    };
};
