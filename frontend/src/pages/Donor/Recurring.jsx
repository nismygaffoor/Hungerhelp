import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { Plus, Edit2, Pause, Play } from 'lucide-react';

const Recurring = () => {
    const [recurringItems] = useState([
        { id: 1, title: 'Rice and Curry', day: 'On Monday', frequency: '10kg Weekly', destination: "Children's home", img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { id: 2, title: 'Rice and Curry', day: 'On Monday', frequency: '10kg Weekly', destination: "Children's home", img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { id: 3, title: 'Rice and Curry', day: 'On Monday', frequency: '10kg Weekly', destination: "Children's home", img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { id: 4, title: 'Rice and Curry', day: 'On Monday', frequency: '10kg Weekly', destination: "Children's home", img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { id: 5, title: 'Rice and Curry', day: 'On Monday', frequency: '10kg Weekly', destination: "Children's home", img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { id: 6, title: 'Rice and Curry', day: 'On Monday', frequency: '10kg Weekly', destination: "Children's home", img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { id: 7, title: 'Rice and Curry', day: 'On Monday', frequency: '10kg Weekly', destination: "Children's home", img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
    ]);

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64">
                <Navbar />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Manage Recurring Donations</h1>
                        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4">Recurring Donations</h2>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Content: Recurring Items List */}
                        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                            <div className="space-y-6">
                                {recurringItems.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 hover:bg-gray-50/50 rounded-2xl transition-all group">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-base font-bold text-gray-800 leading-tight mb-1">{item.title}</h3>
                                                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight">
                                                    <p>{item.day}</p>
                                                    <p>{item.frequency}</p>
                                                    <p className="text-gray-400 font-medium">{item.destination}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button className="flex-1 sm:flex-none px-6 py-2 bg-[#76B56E] hover:bg-[#65a35e] text-white text-xs font-bold rounded-full transition-all shadow-sm">
                                                Edit
                                            </button>
                                            <button className="flex-1 sm:flex-none px-6 py-2 bg-[#E5E7EB] hover:bg-gray-300 text-gray-600 text-xs font-bold rounded-full transition-all">
                                                Pause
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Sidebar: Quick Actions & Details */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            {/* Quick Actions Card */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                                <button className="w-full py-4 px-6 bg-[#76B56E] hover:bg-[#65a35e] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base">
                                    Create Recurring Donations
                                </button>
                            </div>

                            {/* Recent Donations Detail Card */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Recent Donations</h3>

                                <div className="space-y-10">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                            <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&h=100&fit=crop" alt="Food" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-400/80 leading-relaxed">
                                                Food Type: <span className="text-gray-700">Vegetables, Baked Goods</span>
                                            </p>
                                            <p className="text-sm font-bold text-gray-400/80">10kg Weekly</p>
                                            <p className="text-sm font-bold text-gray-400/50">Elders Home</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-gray-900 font-bold text-base leading-tight">Pickup Day <span className="text-gray-400 font-medium">Every Monday</span></p>
                                            <p className="text-gray-300 font-bold text-base tracking-tight mt-1">Pickup Time:<span className="font-medium text-gray-400 px-1 text-sm">9AM-10-10AM</span></p>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <button className="flex-1 py-3 bg-[#76B56E] hover:bg-[#65a35e] text-white text-sm font-bold rounded-2xl transition-all shadow-sm">
                                                Edit
                                            </button>
                                            <button className="flex-1 py-3 bg-[#E5E7EB] hover:bg-gray-300 text-gray-500 text-sm font-bold rounded-2xl transition-all">
                                                Pause
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Recurring;
