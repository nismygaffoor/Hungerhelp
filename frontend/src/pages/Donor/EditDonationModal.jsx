import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
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
            setFormData({
                items: item.items || [{ category: item.food_type?.split(' - ')[0] || '', quantity: item.quantity || '', images: [] }],
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

            const submissionData = {
                ...formData,
                location: formData.pickup_times ? `${formData.location} | ${formData.pickup_times}` : formData.location,
                food_type: formData.description ? `${foodTypeString} - ${formData.description}` : foodTypeString,
                quantity: quantityString
            };
            delete submissionData.pickup_times;

            await api.put(`/food/${item._id}`, submissionData);
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
                                            <input
                                                required
                                                type="text"
                                                placeholder="Item type"
                                                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                                                value={foodItem.category}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].category = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </div>
                                        <div className="w-1/3">
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
                                                <div key={imgIdx} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                    <img
                                                        src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`}
                                                        className="w-full h-full object-cover"
                                                        alt="Item"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    items: [...formData.items, { category: '', quantity: '', images: [] }]
                                })}
                                className="text-sm font-bold text-green-600 hover:text-green-700 ml-1"
                            >
                                + Add another item
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            {!formData.is_recurring && (
                                <>
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
                                </>
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
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Frequency</label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                            value={formData.frequency}
                                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        >
                                            <option>Daily</option>
                                            <option>Weekly</option>
                                            <option>Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Day</label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                            value={formData.day}
                                            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                        >
                                            <option>Everyday</option>
                                            <option>Monday</option>
                                            <option>Tuesday</option>
                                            <option>Wednesday</option>
                                            <option>Thursday</option>
                                            <option>Friday</option>
                                            <option>Saturday</option>
                                            <option>Sunday</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                            Beneficiary Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                            value={formData.destination_type}
                                            onChange={(e) => setFormData({ ...formData, destination_type: e.target.value })}
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
                                    <div className="col-span-2">
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
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">Set as recurring donation</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_recurring: !formData.is_recurring })}
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
