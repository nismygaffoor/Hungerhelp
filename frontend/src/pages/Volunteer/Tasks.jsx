import { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

import { translateStatus } from '../../i18n/donorVolunteerI18n';

import api from '../../api/axios';

import Sidebar from './Sidebar';

import Navbar from '../../components/Navbar';

import {

    Truck,

    Search,

    MapPin,

    Clock,

    Package,

    ArrowRight,

    AlertCircle

} from 'lucide-react';



const Tasks = () => {

    const { t } = useTranslation();

    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(true);

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [acceptingId, setAcceptingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const [error, setError] = useState('');



    const fetchTasks = async () => {

        try {

            setError('');

            const res = await api.get('/delivery/available');

            setTasks(res.data);

        } catch (err) {

            console.error(err);

            setError(err.response?.data?.message || t('volunteer.tasks.loadFailed'));

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        fetchTasks();

    }, []);



    const filteredTasks = tasks.filter(task => {

        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();

        return (

            task.food_type?.toLowerCase().includes(term) ||

            task.pickup_location?.toLowerCase().includes(term) ||

            task.dropoff_location?.toLowerCase().includes(term) ||

            task.quantity?.toLowerCase().includes(term)

        );

    });



    const formatLocation = (location) => {

        if (!location) return t('volunteer.dashboard.notSpecified');

        return location.split('|')[0].trim();

    };



    const formatTimeAgo = (dateStr) => {

        if (!dateStr) return t('volunteer.tasks.justNow');

        const diff = Date.now() - new Date(dateStr).getTime();

        const minutes = Math.floor(diff / (1000 * 60));

        const hours = Math.floor(minutes / 60);

        const days = Math.floor(hours / 24);

        if (days > 0) return t('volunteer.tasks.daysAgo', { count: days });

        if (hours > 0) return t('volunteer.tasks.hoursAgo', { count: hours });

        if (minutes > 0) return t('volunteer.tasks.minsAgo', { count: minutes });

        return t('volunteer.tasks.justNow');

    };



    const handleAccept = async (taskId) => {

        if (!confirm(t('volunteer.tasks.acceptConfirm'))) return;



        setAcceptingId(taskId);

        try {

            const res = await api.post(`/delivery/${taskId}/accept`);

            alert(res.data.message);

            setTasks(tasks.filter(t => t._id !== taskId));

            navigate('/volunteer/history');

        } catch (err) {

            console.error('Accept error:', err);

            alert(err.response?.data?.message || t('volunteer.tasks.acceptFailed'));

            fetchTasks();

        } finally {

            setAcceptingId(null);

        }

    };



    return (

        <div className="flex min-h-screen bg-white font-sans text-gray-800">

            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>

                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">

                    <header className="mb-8 text-left">

                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">{t('volunteer.tasks.title')}</h2>

                        <p className="text-gray-500 text-sm font-medium mt-1">

                            {t('volunteer.tasks.subtitle')}

                        </p>

                    </header>



                    <div className="flex flex-wrap items-center gap-4 mb-8">

                        <div className="flex items-center gap-2 bg-[#E8F5E9] text-[#1E5144] px-4 py-2 rounded-xl">

                            <Truck size={16} />

                            <span className="text-xs font-bold">

                                {loading ? t('common.loading') : t('volunteer.tasks.pendingTasks', { count: tasks.length })}

                            </span>

                        </div>



                        <div className="relative flex-1 max-w-md ml-auto">

                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

                            <input

                                type="text"

                                placeholder={t('volunteer.tasks.searchPlaceholder')}

                                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-2.5 shadow-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none text-sm placeholder-gray-400 transition-all"

                                value={searchTerm}

                                onChange={(e) => setSearchTerm(e.target.value)}

                            />

                        </div>

                    </div>



                    {error && (

                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">

                            <AlertCircle size={18} />

                            {error}

                        </div>

                    )}



                    {loading ? (

                        <div className="flex justify-center p-20">

                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>

                        </div>

                    ) : filteredTasks.length === 0 ? (

                        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">

                            <Truck size={48} className="text-gray-300 mb-4" />

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">

                                {tasks.length === 0 ? t('volunteer.tasks.noPending') : t('volunteer.tasks.noSearchMatch')}

                            </h3>

                            <p className="text-gray-500 max-w-md">

                                {tasks.length === 0

                                    ? t('volunteer.tasks.emptyHint')

                                    : t('volunteer.tasks.searchHint')}

                            </p>

                            {searchTerm && (

                                <button

                                    onClick={() => setSearchTerm('')}

                                    className="mt-4 text-green-600 font-bold text-sm hover:underline"

                                >

                                    {t('volunteer.tasks.clearSearch')}

                                </button>

                            )}

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 gap-6">

                            {filteredTasks.map((task) => (

                                <div

                                    key={task._id}

                                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"

                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                                        <div className="flex-1 space-y-4">

                                            <div className="flex flex-wrap items-center gap-3">

                                                <h3 className="text-lg font-bold text-gray-900">

                                                    {task.food_type || t('volunteer.tasks.foodDonation')}

                                                </h3>

                                                {task.is_urgent && (

                                                    <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">

                                                        {t('volunteer.tasks.urgent')}

                                                    </span>

                                                )}

                                                <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">

                                                    {translateStatus('Pending', t)}

                                                </span>

                                            </div>



                                            {task.quantity && (

                                                <div className="flex items-center gap-2 text-gray-600">

                                                    <Package size={16} className="text-gray-400" />

                                                    <span className="text-sm font-medium">{task.quantity}</span>

                                                </div>

                                            )}



                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">

                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">

                                                        {t('volunteer.tasks.pickup')}

                                                    </p>

                                                    <div className="flex items-start gap-2">

                                                        <MapPin size={16} className="text-green-600 mt-0.5 shrink-0" />

                                                        <span className="text-sm font-bold text-gray-800">

                                                            {formatLocation(task.pickup_location)}

                                                        </span>

                                                    </div>

                                                </div>

                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">

                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">

                                                        {t('volunteer.tasks.dropoff')}

                                                    </p>

                                                    <div className="flex items-start gap-2">

                                                        <MapPin size={16} className="text-[#1E5144] mt-0.5 shrink-0" />

                                                        <span className="text-sm font-bold text-gray-800">

                                                            {formatLocation(task.dropoff_location)}

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>



                                            <div className="flex items-center gap-2 text-gray-400">

                                                <Clock size={14} />

                                                <span className="text-xs font-medium">

                                                    {t('volunteer.tasks.posted', { time: formatTimeAgo(task.created_at) })}

                                                </span>

                                            </div>

                                        </div>



                                        <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">

                                            <button

                                                onClick={() => handleAccept(task._id)}

                                                disabled={acceptingId === task._id}

                                                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#1E5144] hover:bg-[#163d33] shadow-lg shadow-green-900/10 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"

                                            >

                                                {acceptingId === task._id ? (

                                                    t('volunteer.tasks.accepting')

                                                ) : (

                                                    <>

                                                        {t('volunteer.tasks.acceptTask')}

                                                        <ArrowRight size={16} />

                                                    </>

                                                )}

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </main>

        </div>

    );

};



export default Tasks;


