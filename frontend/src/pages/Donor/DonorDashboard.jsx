import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    User,
    Utensils,
    Repeat,
    List,
    MessageSquare,
    Bell,
    Camera,
    MapPin,
    Clock,
    Trash2
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const DonorDashboard = ({ user }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('post'); // Default: Create Post

    // Form State
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(user.address || '');
    const [pickupTimes, setPickupTimes] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);

    // Data State
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'mydonations') {
            fetchMyPosts();
        }
    }, [activeTab]);

    const fetchMyPosts = async () => {
        try {
            const res = await api.get('/food/my-posts');
            setMyPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePost = async () => {
        if (!category || !quantity || !location) {
            alert("Please fill in required fields.");
            return;
        }

        setLoading(true);
        try {
            // Mapping UI fields to Backend Model
            await api.post('/food/', {
                food_type: `${category} - ${description}`,
                quantity: quantity,
                location: `${location} | ${pickupTimes}`,
                expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default 24h expiry for now
            });
            alert('Food posted successfully!');
            // Reset Form
            setCategory('');
            setQuantity('');
            setDescription('');
            setPickupTimes('');
            setIsUrgent(false);
            setActiveTab('mydonations'); // Switch to view posts
        } catch (err) {
            alert('Failed to post food.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this donation?")) return;
        try {
            await api.delete(`/food/${id}`);
            fetchMyPosts();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    // Sidebar Config
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'profile', label: 'Your Profile', icon: <User size={20} /> },
        { id: 'post', label: 'Post Food', icon: <Utensils size={20} /> },
        { id: 'recurring', label: 'Recurring Donations', icon: <Repeat size={20} /> },
        { id: 'mydonations', label: 'My Donations', icon: <List size={20} /> },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">

            {/* Reuse Sidebar */}
            <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-8">

                {/* Top Navbar */}
                <header className="flex justify-between items-center mb-10">
                    <div className="md:hidden">
                        <span className="text-green-600 font-bold text-xl">HungerHelp</span>
                    </div>
                    <div className="hidden md:block"></div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer">
                            <Bell className="text-gray-500 hover:text-green-600" size={24} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full wi-4 h-4 flex items-center justify-center px-1">6</span>
                        </div>

                        <div className="flex items-center gap-2 cursor-pointer">
                            <span className="text-sm font-medium">English</span>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                {activeTab === 'post' && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">Create Food Post</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column - Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Food Details Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold mb-6 text-gray-800">Food Details</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Food Category</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Fresh Produce, Baked Goods, Canned Goods"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                            <input
                                                type="text"
                                                placeholder="Approximate weight in kg or number of servings"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Briefly describe the food items, e.g., '5kg organic apples, 2 loaves sourdough'"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Info Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold mb-6 text-gray-800">Pickup Information</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g., 123 Main St, Anytown"
                                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                    value={location}
                                                    onChange={e => setLocation(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Available Pickup Times</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Mon-Fri 9 AM - 5 PM"
                                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                    value={pickupTimes}
                                                    onChange={e => setPickupTimes(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Photos & Settings */}
                            <div className="space-y-6">
                                {/* Photos Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold mb-6 text-gray-800">Food Photos</h3>

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer">
                                        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Camera className="text-gray-500" size={24} />
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">Drag & drop photos here or click to upload</p>
                                        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50">Upload Photo</button>
                                    </div>
                                </div>

                                {/* Scheduling Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-bold mb-6 text-gray-800">Scheduling & Urgency</h3>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Set up as a recurring donation</span>
                                            <button
                                                onClick={() => setIsRecurring(!isRecurring)}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-green-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isRecurring ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="block text-sm font-medium text-gray-700">Mark as urgent</span>
                                                <span className="text-xs text-gray-500 mt-1 max-w-[200px] block">Urgent alerts notify volunteers immediately.</span>
                                            </div>
                                            <button
                                                onClick={() => setIsUrgent(!isUrgent)}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${isUrgent ? 'bg-green-600' : 'bg-gray-300'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isUrgent ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handlePost}
                                    disabled={loading}
                                    className="w-full bg-green-700 text-white font-bold text-lg py-4 rounded-xl shadow hover:bg-green-800 transition transform active:scale-95 disabled:opacity-70"
                                >
                                    {loading ? 'Posting...' : 'Donate Food'}
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {activeTab === 'mydonations' && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">My Donations</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {myPosts.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">You haven't posted any donations yet.</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="p-4 font-semibold">Food Item</th>
                                            <th className="p-4 font-semibold">Quantity</th>
                                            <th className="p-4 font-semibold">Location</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {myPosts.map(post => (
                                            <tr key={post._id} className="hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-800">{post.food_type}</td>
                                                <td className="p-4 text-gray-600">{post.quantity}</td>
                                                <td className="p-4 text-gray-600">{post.location}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${post.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {post.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => handleDelete(post._id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Placeholders for other tabs */}
                {['dashboard', 'profile', 'recurring', 'feedback', 'settings'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <Settings size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-600">Under Construction</h3>
                        <p>This "{activeTab}" section is a placeholder for the demo.</p>
                    </div>
                )}

            </main>
        </div>
    );
};

export default DonorDashboard;
