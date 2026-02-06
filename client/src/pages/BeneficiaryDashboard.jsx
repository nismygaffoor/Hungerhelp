import { useState, useEffect } from 'react';
import api from '../api/axios';

const BeneficiaryDashboard = () => {
    const [availableFood, setAvailableFood] = useState([]);
    const [myRequests, setMyRequests] = useState([]); // Placeholder for now

    useEffect(() => {
        fetchFood();
    }, []);

    const fetchFood = async () => {
        try {
            const res = await api.get('/food/');
            setAvailableFood(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClaim = async (id) => {
        if (!confirm("Claim this food? A volunteer will be notified.")) return;
        try {
            await api.post(`/food/${id}/claim`);
            alert("Food claimed successfully!");
            fetchFood(); // Refresh
        } catch (err) {
            alert("Failed to claim: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-4 text-green-700">Available Food</h3>
                {availableFood.length === 0 ? <p className="text-gray-500">No food available right now.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableFood.map(post => (
                            <div key={post._id} className="border p-4 rounded bg-green-50 hover:shadow-lg transition">
                                <h4 className="font-bold text-lg text-green-900">{post.food_type}</h4>
                                <p className="text-gray-700">Quantity: {post.quantity}</p>
                                <p className="text-gray-600 text-sm">📍 {post.location}</p>
                                <p className="text-gray-500 text-xs mt-1">Expires: {post.expiry_time?.replace("T", " ")}</p>
                                <button
                                    onClick={() => handleClaim(post._id)}
                                    className="mt-3 w-full bg-green-600 text-white py-1 rounded hover:bg-green-700 font-medium"
                                >
                                    Claim
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Future: My Requests Section */}
        </div>
    );
};

export default BeneficiaryDashboard;
