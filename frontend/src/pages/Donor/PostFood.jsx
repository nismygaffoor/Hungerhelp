import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Camera,
    MapPin,
    Clock,
    Utensils,
    Scale,
    FileText,
    Trash2
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const PostFood = () => {
    const { user } = useAuth();
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(user?.address || '');
    const [pickupTimes, setPickupTimes] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) {
            alert("Maximum 4 images allowed.");
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handlePost = async () => {
        if (!category || !quantity || !location) {
            alert("Please fill in required fields.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('food_type', `${category} - ${description}`);
            formData.append('quantity', quantity);
            formData.append('location', `${location} | ${pickupTimes}`);
            formData.append('expiry_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
            formData.append('description', description);

            images.forEach((image) => {
                formData.append('images', image);
            });

            await api.post('/food/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Food posted successfully!');
            setCategory('');
            setQuantity('');
            setDescription('');
            setPickupTimes('');
            setIsUrgent(false);
            setImages([]);
            setPreviews([]);
        } catch (err) {
            alert('Failed to post food.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />
                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Post Food</h2>
                        <p className="text-gray-500 text-sm mt-1">Share surplus food with those in need.</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in relative pb-20">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Food Details */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-6 text-gray-800">Food Details</h3>
                                {/* ... form fields ... */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Food Category</label>
                                        <div className="relative">
                                            <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g., Fresh Produce, Baked Goods, Canned Goods"
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm"
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Quantity</label>
                                        <div className="relative">
                                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Approximate weight in kg or number of servings"
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-4 text-gray-400" size={18} />
                                            <textarea
                                                rows="4"
                                                placeholder="Briefly describe the food items, e.g., '5kg organic apples, 2 loaves sourdough'"
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm resize-none"
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Pickup Information */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-6 text-gray-800">Pickup Information</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Pickup Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g., 123 Main St, Anytown"
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm"
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Available Pickup Times</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g., Mon-Fri 9 AM - 5 PM"
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm"
                                                value={pickupTimes}
                                                onChange={e => setPickupTimes(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                                <h3 className="text-xl font-bold mb-6 text-gray-800">Food Photos</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {previews.length < 4 && (
                                            <label className="border-2 border-dashed border-gray-200 rounded-xl aspect-square flex flex-col items-center justify-center hover:bg-gray-50 transition-all cursor-pointer group">
                                                <Camera className="text-gray-400 group-hover:text-green-600 mb-2" size={24} />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Photo</span>
                                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium italic">Upload up to 4 clear photos of the food items.</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-2 text-gray-800">Scheduling & Urgency</h3>
                                <div className="space-y-8 mt-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-700">Set up as a recurring donation</span>
                                        <button onClick={() => setIsRecurring(!isRecurring)} className={`w-12 h-6 rounded-full relative transition-colors ${isRecurring ? 'bg-green-600' : 'bg-gray-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isRecurring ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-700">Mark as urgent</span>
                                            <button onClick={() => setIsUrgent(!isUrgent)} className={`w-12 h-6 rounded-full relative transition-colors ${isUrgent ? 'bg-green-600' : 'bg-gray-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isUrgent ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-gray-400 italic">Urgent alerts notify volunteers immediately for time-sensitive food items.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handlePost} disabled={loading} className="bg-[#43A047] text-white font-bold px-12 py-3.5 rounded-lg shadow-lg hover:bg-[#2E7D32] transition-all transform active:scale-95 disabled:opacity-70 text-base">
                                    {loading ? 'Posting...' : 'Donate Food'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PostFood;
