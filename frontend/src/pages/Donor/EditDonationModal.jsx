import { useState, useEffect } from 'react';
import { X, Loader2, Plus, ChevronDown } from 'lucide-react';
import api from '../../api/axios';

const EditDonationModal = ({ isOpen, onClose, item, onUpdate }) => {
    const [formData, setFormData] = useState({
        items: [],
        location: '',
        pickup_times: '',
        description: '',
        expiry_time: '',
        is_urgent: false,
        is_recurring: false,
        frequency: '',
        day: '',
        destination: '',
        destination_type: '',
        destination_name: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            const [loc, times] = (item.location || '').split(' | ');
            
            // Handle legacy data where images might be at the top level instead of per-item
            let initialItems = item.items;
            if (!initialItems || initialItems.length === 0) {
                initialItems = [{ 
                    category: item.food_type?.split(' - ')[0] || '', 
                    name: item.food_type?.split(' - ')[1] || '',
                    quantity: item.quantity || '', 
                    images: item.images || [] 
                }];
            }

            setFormData({
                items: initialItems,
                location: loc || '',
                pickup_times: times || '',
                description: item.description || '',
                expiry_time: item.expiry_time ? new Date(item.expiry_time).toISOString().slice(0, 16) : '',
                is_urgent: item.is_urgent || false,
                is_recurring: item.is_recurring || false,
                frequency: item.frequency || '',
                day: item.day || '',
                destination: item.destination || '',
                destination_type: item.destination_type || '',
                destination_name: item.destination_name || ''
            });
        }
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const foodTypeString = formData.items.map(i => i.category).join(', ');
            const quantityString = formData.items.map(i => i.quantity).join(', ');

            const food_type = formData.description ? `${foodTypeString} - ${formData.description}` : foodTypeString;
            const location = formData.pickup_times ? `${formData.location} | ${formData.pickup_times}` : formData.location;

            const form = new FormData();
            form.append('food_type', food_type);
            form.append('quantity', quantityString);
            form.append('location', location);
            form.append('description', formData.description || '');
            form.append('is_urgent', String(formData.is_urgent));
            form.append('is_recurring', String(formData.is_recurring));
            form.append('destination_type', formData.destination_type || '');
            form.append('destination_name', formData.destination_name || '');

            if (formData.is_recurring) {
                form.append('frequency', formData.frequency);
                form.append('day', formData.day);
            } else {
                form.append('expiry_time', formData.expiry_time);
            }

            // Prepare items (keeping existing image paths)
            const cleanItems = formData.items.map(item => ({
                category: item.category,
                name: item.name || '',
                quantity: item.quantity,
                images: item.images || []
            }));
            form.append('items', JSON.stringify(cleanItems));

            // Append new item images
            formData.items.forEach((item, index) => {
                if (item.newFiles) {
                    item.newFiles.forEach(file => {
                        form.append(`item_images_${index}`, file);
                    });
                }
            });

            await api.put(`/food/${item._id}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update donation");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
                <div className="p-6 sticky top-0 bg-white z-10 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                            Edit {item.is_recurring ? 'Recurring' : 'Donation'}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Food Items</label>
                            {formData.items.map((foodItem, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none appearance-none cursor-pointer"
                                                    value={foodItem.category}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index].category = e.target.value;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                >
                                                    <option value="" disabled>Select Type</option>
                                                    {/* Fallback for legacy categories like "JK" */}
                                                    {foodItem.category && ![
                                                        "Vegetables", "Fruits", "Cooked Meals", "Baked Goods", 
                                                        "Grains & Rice", "Dairy", "Meat & Poultry", "Canned Food", 
                                                        "Beverages", "Other"
                                                    ].includes(foodItem.category) && (
                                                        <option value={foodItem.category}>{foodItem.category}</option>
                                                    )}
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
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Item Name (e.g. Basmati Rice)"
                                                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                                                value={foodItem.name || ''}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].name = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </div>
                                        <div className="w-1/4">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Qty"
                                                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                                                value={foodItem.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].quantity = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </div>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = formData.items.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                                className="p-3 text-red-400 hover:text-red-600 transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Existing Images for this item */}
                                    {foodItem.images?.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {foodItem.images.map((img, imgIdx) => (
                                                <div key={imgIdx} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative group">
                                                    <img
                                                        src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`}
                                                        className="w-full h-full object-cover"
                                                        alt="Item"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newItems = [...formData.items];
                                                            newItems[index].images = newItems[index].images.filter((_, i) => i !== imgIdx);
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove Image"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* New Image Upload */}
                                    <div className="mt-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                            {(foodItem.images?.length > 0 || foodItem.newFiles?.length > 0) ? 'Current Image' : 'Add Photo'}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {(foodItem.newFiles || []).map((file, fIdx) => (
                                                <div key={fIdx} className="w-12 h-12 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center relative overflow-hidden">
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const newItems = [...formData.items];
                                                            newItems[index].newFiles = newItems[index].newFiles.filter((_, i) => i !== fIdx);
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className={`w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all ${(foodItem.newFiles?.length > 0 || foodItem.images?.length > 0) ? 'hidden' : ''}`}>
                                                <Plus size={16} className="text-gray-400" />
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        if (files.length > 0) {
                                                            const newItems = [...formData.items];
                                                            newItems[index].newFiles = [files[0]];
                                                            setFormData({ ...formData, items: newItems });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    items: [...formData.items, { category: '', name: '', quantity: '', images: [], newFiles: [] }]
                                })}
                                className="text-sm font-bold text-green-600 hover:text-green-700 ml-1"
                            >
                                + Add another item
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Pickup Times</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 9AM - 5PM"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                        value={formData.pickup_times}
                                        onChange={(e) => setFormData({ ...formData, pickup_times: e.target.value })}
                                    />
                                </div>
                            </div>

                            {!formData.is_recurring && (
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Expiry Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                        value={formData.expiry_time}
                                        onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {formData.is_recurring && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Frequency <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer ${!formData.frequency ? 'text-red-400' : 'text-gray-700'}`}
                                            value={formData.frequency}
                                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        >
                                            <option value="">⚠️ Select frequency...</option>
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Day <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer ${!formData.day ? 'text-red-400' : 'text-gray-700'}`}
                                            value={formData.day}
                                            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                        >
                                            <option value="">⚠️ Select day...</option>
                                            <option value="Everyday">Everyday</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                            <option value="Saturday">Saturday</option>
                                            <option value="Sunday">Sunday</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Target Beneficiary — always visible for all donation types */}
                            <div className="col-span-2 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-4">Target Beneficiary</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                            Beneficiary Type
                                        </label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                            value={formData.destination_type}
                                            onChange={(e) => setFormData({ ...formData, destination_type: e.target.value })}
                                        >
                                            <option value="">All Beneficiaries</option>
                                            <option value="Elder's Home">Elder's Home</option>
                                            <option value="Orphanage">Orphanage</option>
                                            <option value="Individual">Individual</option>
                                            <option value="Community Center">Community Center</option>
                                            <option value="Shelter">Shelter</option>
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">
                                            {formData.destination_type
                                                ? `Only ${formData.destination_type} beneficiaries will see this donation`
                                                : 'Visible to all beneficiaries on the platform'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                            Specific Beneficiary Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., St. Mary's Elder Home"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                            value={formData.destination_name}
                                            onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">If specified, only this beneficiary will see the donation</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">Set as recurring donation</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ 
                                        ...formData, 
                                        is_recurring: !formData.is_recurring,
                                        // When switching to recurring, reset frequency/day so user must choose
                                        // and set status to Active
                                        ...(!formData.is_recurring ? { 
                                            frequency: '', 
                                            day: '',
                                            status: 'Active'
                                        } : {
                                            status: 'Available'
                                        })
                                    })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_recurring ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.is_recurring ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">Mark as urgent</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_urgent: !formData.is_urgent })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_urgent ? 'bg-red-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.is_urgent ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {formData.images?.length > 0 && (
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Current Images (Read-only)</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {formData.images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`}
                                                alt="food"
                                                className="w-16 h-16 object-cover rounded-xl shadow-sm border border-white flex-shrink-0"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-[#76B56E] hover:bg-[#65a35e] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDonationModal;
