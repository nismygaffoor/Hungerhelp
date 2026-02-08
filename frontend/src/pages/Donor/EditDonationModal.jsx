import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const EditDonationModal = ({ isOpen, onClose, item, onUpdate }) => {
    const [formData, setFormData] = useState({
        food_type: '',
        quantity: '',
        location: '',
        pickup_times: '',
        description: '',
        expiry_time: '',
        is_urgent: false,
        is_recurring: false,
        frequency: '',
        day: '',
        destination: '',
        images: []
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            const [loc, times] = (item.location || '').split(' | ');
            setFormData({
                food_type: item.food_type?.split(' - ')[0] || '',
                quantity: item.quantity || '',
                location: loc || '',
                pickup_times: times || '',
                description: item.description || '',
                expiry_time: item.expiry_time ? new Date(item.expiry_time).toISOString().slice(0, 16) : '',
                is_urgent: item.is_urgent || false,
                is_recurring: item.is_recurring || false,
                frequency: item.frequency || '',
                day: item.day || '',
                destination: item.destination || '',
                images: item.images || []
            });
        }
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const submissionData = {
                ...formData,
                location: formData.pickup_times ? `${formData.location} | ${formData.pickup_times}` : formData.location,
                food_type: formData.description ? `${formData.food_type} - ${formData.description}` : formData.food_type
            };
            delete submissionData.pickup_times; // Don't send this as separate field
            delete submissionData.images; // Currently images not editable via PUT

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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Food Category</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Fresh Produce, Baked Goods"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={formData.food_type}
                                    onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Quantity</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>

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
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Destination</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                            value={formData.destination}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        />
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
