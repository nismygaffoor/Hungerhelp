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
    const [items, setItems] = useState([{ category: '', quantity: '', images: [], previews: [] }]);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(user?.address || '');
    const [pickupTimes, setPickupTimes] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState('Weekly');
    const [recurringDay, setRecurringDay] = useState('Monday');
    const [destination, setDestination] = useState('');
    const [destinationType, setDestinationType] = useState('');
    const [destinationName, setDestinationName] = useState('');
    const [loading, setLoading] = useState(false);
    const [expiryDate, setExpiryDate] = useState(() => {
        const date = new Date();
        date.setHours(date.getHours() + 24);
        return date.toISOString().slice(0, 16);
    });

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { category: '', quantity: '', images: [], previews: [] }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleItemImageChange = (index, e) => {
        const files = Array.from(e.target.files);
        const currentItem = items[index];

        if (currentItem.images.length + files.length > 4) {
            alert("Maximum 4 images per item allowed.");
            return;
        }

        const newItems = [...items];
        newItems[index].images = [...currentItem.images, ...files];
        const newPreviews = files.map(file => URL.createObjectURL(file));
        newItems[index].previews = [...currentItem.previews, ...newPreviews];
        setItems(newItems);
    };

    const removeItemImage = (itemIndex, imageIndex) => {
        const newItems = [...items];
        const item = newItems[itemIndex];

        const newImages = [...item.images];
        newImages.splice(imageIndex, 1);
        item.images = newImages;

        const newPreviews = [...item.previews];
        newPreviews.splice(imageIndex, 1);
        item.previews = newPreviews;

        setItems(newItems);
    };

    const handlePost = async () => {
        // Validate all items
        const invalidItems = items.some(item => !item.category || !item.quantity);
        if (invalidItems || !location) {
            alert("Please fill in required fields for all items.");
            return;
        }

        setLoading(true);
        try {
            // Aggregate items into strings for backward compatibility
            const foodTypeString = items.map(i => i.category).join(', ');
            const quantityString = items.map(i => i.quantity).join(', ');
            // Description might be generic, so we append it once
            const finalFoodType = description ? `${foodTypeString} - ${description}` : foodTypeString;

            const formData = new FormData();
            formData.append('food_type', finalFoodType);
            formData.append('quantity', quantityString);
            formData.append('location', `${location} | ${pickupTimes}`);
            formData.append('expiry_time', new Date(expiryDate).toISOString());
            formData.append('description', description);
            formData.append('is_recurring', isRecurring);
            formData.append('is_urgent', isUrgent);

            // Send aggregated items as JSON string for potential future use
            const itemsForJson = items.map(item => ({
                category: item.category,
                quantity: item.quantity
            }));
            formData.append('items', JSON.stringify(itemsForJson));

            if (isRecurring) {
                formData.append('frequency', frequency);
                formData.append('day', recurringDay);
                formData.append('destination', destination);
                formData.append('destination_type', destinationType);
                if (destinationName.trim()) {
                    formData.append('destination_name', destinationName.trim());
                }
            }

            // Send per-item images
            items.forEach((item, index) => {
                item.images.forEach((image) => {
                    formData.append(`item_images_${index}`, image);
                });
            });

            await api.post('/food/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Food posted successfully!');
            setItems([{ category: '', quantity: '', images: [], previews: [] }]); // Reset to default
            setDescription('');
            setPickupTimes('');
            setIsUrgent(false);
            setDestinationType('');
            setDestinationName('');
            setExpiryDate(() => {
                const date = new Date();
                date.setHours(date.getHours() + 24);
                return date.toISOString().slice(0, 16);
            });
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

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-xl font-bold mb-6 text-gray-800">Food Details</h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-600">Donated Items</label>
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 animate-fade-in group hover:bg-gray-50 hover:border-gray-200 transition-all">
                                            {/* Category Input */}
                                            <div className="w-full md:flex-[2] relative">
                                                <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Food Type (e.g. Rice)"
                                                    className="w-full border border-gray-100 bg-white rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm"
                                                    value={item.category}
                                                    onChange={e => handleItemChange(index, 'category', e.target.value)}
                                                />
                                            </div>

                                            {/* Quantity Input */}
                                            <div className="w-full md:flex-1 relative">
                                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Qty"
                                                    className="w-full border border-gray-100 bg-white rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </div>

                                            {/* Photos Section */}
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="flex gap-1.5 scrollbar-none overflow-x-auto max-w-[120px]">
                                                    {item.previews.map((preview, imgIndex) => (
                                                        <div key={imgIndex} className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm border border-white">
                                                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => removeItemImage(index, imgIndex)}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={8} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {item.previews.length < 4 && (
                                                    <label className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-white hover:border-green-500/50 transition-all cursor-pointer bg-white shrink-0 group/cam">
                                                        <Camera className="text-gray-400 group-hover/cam:text-green-600" size={16} />
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) => handleItemImageChange(index, e)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            {/* Remove Item Button */}
                                            {items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addItem}
                                    className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-2 px-2 py-1 mt-2 transition-all hover:translate-x-1"
                                >
                                    + Add Another Item
                                </button>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-4 text-gray-400" size={18} />
                                    <textarea
                                        rows="3"
                                        placeholder="Briefly describe the food items..."
                                        className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm resize-none"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in relative pb-20">
                        {/* Left Column */}

                        <div className="space-y-8">

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
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">Food Expiry Date & Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="datetime-local"
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm"
                                                value={expiryDate}
                                                onChange={e => setExpiryDate(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1 italic">Please specify when the food will no longer be safe to consume.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-8">
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

                                    {isRecurring && (
                                        <div className="space-y-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Frequency</label>
                                                    <select
                                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                                        value={frequency}
                                                        onChange={(e) => setFrequency(e.target.value)}
                                                    >
                                                        <option>Daily</option>
                                                        <option>Weekly</option>
                                                        <option>Monthly</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Preferred Day</label>
                                                    <select
                                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                                        value={recurringDay}
                                                        onChange={(e) => setRecurringDay(e.target.value)}
                                                    >
                                                        <option>Monday</option>
                                                        <option>Tuesday</option>
                                                        <option>Wednesday</option>
                                                        <option>Thursday</option>
                                                        <option>Friday</option>
                                                        <option>Saturday</option>
                                                        <option>Sunday</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                                        Beneficiary Type <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                                        value={destinationType}
                                                        onChange={(e) => setDestinationType(e.target.value)}
                                                    >
                                                        <option value="">Select Type...</option>
                                                        <option value="Elder's Home">Elder's Home</option>
                                                        <option value="Orphanage">Orphanage</option>
                                                        <option value="Individual">Individual</option>
                                                        <option value="Community Center">Community Center</option>
                                                        <option value="Shelter">Shelter</option>
                                                    </select>
                                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">This donation will be shown to all beneficiaries of this type</p>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                                        Specific Beneficiary Name (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., St. Mary's Elder Home"
                                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
                                                        value={destinationName}
                                                        onChange={(e) => setDestinationName(e.target.value)}
                                                    />
                                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">If specified, only this beneficiary will see the donation</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
