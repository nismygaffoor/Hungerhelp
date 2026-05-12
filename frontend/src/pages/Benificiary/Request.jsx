import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    MapPin,
    Utensils,
    Scale,
    FileText,
    Loader2,
    Trash2,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const Request = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([{ category: '', name: '', quantity: '' }]);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(user?.address || '');
    const [urgency, setUrgency] = useState('Normal');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { category: '', name: '', quantity: '' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleSubmit = async () => {
        const invalidItems = items.some(item => !item.category || !item.quantity);
        if (invalidItems || !location) {
            alert("Please fill in required fields for all items.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                items: items.map(item => ({
                    category: item.category,
                    name: item.name || '',
                    quantity: item.quantity
                })),
                food_type: items.map(i => i.category).join(', '),
                quantity: items.map(i => i.quantity).join(', '),
                location: location,
                description: description,
                urgency: urgency
            };

            await api.post('/requests/', payload);

            alert('Food request submitted successfully!');
            setItems([{ category: '', name: '', quantity: '' }]);
            setDescription('');
            setUrgency('Normal');
        } catch (err) {
            alert('Failed to submit food request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
 
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
                    <header className="mb-8 text-left">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Request Food</h2>
                        <p className="text-gray-500 font-medium mt-1">Let the community know what you need.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black mb-6 text-gray-800 flex items-center gap-2">
                                    <Utensils className="text-green-600" size={20} />
                                    Needed Items
                                </h3>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex flex-col md:flex-row items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-green-200 transition-all">
                                            {/* Category Input */}
                                            <div className="w-full md:flex-[2] relative">
                                                <select
                                                    className="w-full border border-gray-100 bg-white rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                                                    value={item.category}
                                                    onChange={e => handleItemChange(index, 'category', e.target.value)}
                                                >
                                                    <option value="" disabled>Select Category</option>
                                                    <option value="Vegetables">Vegetables</option>
                                                    <option value="Fruits">Fruits</option>
                                                    <option value="Cooked Meals">Cooked Meals</option>
                                                    <option value="Baked Goods">Baked Goods</option>
                                                    <option value="Grains & Rice">Grains & Rice</option>
                                                    <option value="Dairy">Dairy</option>
                                                    <option value="Meat & Poultry">Meat & Poultry</option>
                                                    <option value="Canned Food">Canned Food</option>
                                                    <option value="Beverages">Beverages</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                            </div>

                                            {/* Name Input */}
                                            <div className="w-full md:flex-[2] relative">
                                                <input
                                                    type="text"
                                                    placeholder="Item Name (Optional)"
                                                    className="w-full border border-gray-100 bg-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm font-bold"
                                                    value={item.name}
                                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                                />
                                            </div>

                                            {/* Quantity Input */}
                                            <div className="w-full md:flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Qty"
                                                    className="w-full border border-gray-100 bg-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm font-bold"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </div>

                                            {/* Remove Item Button */}
                                            {items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addItem}
                                    className="text-[10px] font-black text-green-600 hover:text-green-700 uppercase tracking-widest flex items-center gap-2 mt-4 transition-all hover:translate-x-1"
                                >
                                    + Add Another Item
                                </button>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black mb-6 text-gray-800 flex items-center gap-2">
                                    <FileText className="text-green-600" size={20} />
                                    Additional Details
                                </h3>
                                <textarea
                                    rows="4"
                                    placeholder="Explain why these items are needed (optional)..."
                                    className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white focus:outline-none transition-all text-sm font-medium resize-none"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Sidebar Content */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black mb-6 text-gray-800">Logistics</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Delivery Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Where to deliver?"
                                                className="w-full border border-gray-100 bg-gray-50 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500/20 focus:bg-white focus:outline-none transition-all text-sm font-bold"
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Urgency Level</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Normal', 'Medium', 'High'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setUrgency(level)}
                                                    className={`py-2 text-[10px] font-black rounded-xl border transition-all uppercase tracking-widest ${
                                                        urgency === level 
                                                        ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20' 
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-green-200'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-900 rounded-[2rem] p-8 shadow-xl text-white">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                        <AlertCircle size={24} className="text-green-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-green-300 mb-2">Notice</h4>
                                        <p className="text-xs font-medium text-green-50/80 leading-relaxed">
                                            Donors will see your request. We'll notify you once someone matches your request with a donation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-[#43A047] hover:bg-[#2E7D32] text-white font-black py-4 rounded-2xl shadow-lg shadow-green-600/20 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Request;

