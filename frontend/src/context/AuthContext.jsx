import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import i18n from '../i18n';
import { normalizeLanguageCode, persistLanguage } from '../i18n/languages';

const applyUserLanguage = (user) => {
    if (!user?.language) return;
    const code = normalizeLanguageCode(user.language);
    i18n.changeLanguage(code);
    persistLanguage(code);
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                logout();
                setLoading(false);
                return;
            }

            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                applyUserLanguage(parsed);
            }

            const res = await api.get('/auth/me');
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            applyUserLanguage(res.data);
        } catch (error) {
            console.error('Failed to load user', error);
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    const decoded = jwtDecode(token);
                    setUser({ ...parsed, user_id: decoded.user_id, role: decoded.role });
                } catch {
                    logout();
                }
            } else {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (email, password, role) => {
        try {
            const res = await api.post('/auth/login', { email, password, role });
            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            applyUserLanguage(user);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return {
                success: false,
                message: error.response?.data?.error || "Login failed"
            };
        }
    };

    const registerUser = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || "Registration failed"
            };
        }
    };

    const updateUser = (updates) => {
        setUser(prev => {
            const next = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(next));
            return next;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, registerUser, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
