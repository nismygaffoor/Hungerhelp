import { useState, useEffect } from 'react';
import api from '../api/axios';

const DonorDashboard = ({ user }) => {
    const [foodType, setFoodType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [location, setLocation] = useState(user.address || ''); // Default to user address
    const [expiry, setExpiry] = useState('');
    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        try {
            const res = await api.get('/food/my-posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/food/', {
                food_type: foodType,
                quantity: quantity,
                location: location,
                expiry_time: expiry
            });
            setMessage('Food posted successfully!');
            fetchMyPosts();
            setFoodType('');
            setQuantity('');
            setExpiry('');
        } catch (err) {
            setMessage('Failed to post food.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/food/${id}`);
            fetchMyPosts();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-4 text-green-700">Donate Food</h3>
                {message && <div className="p-2 mb-2 bg-blue-100 text-blue-700 rounded">{message}</div>}
                <form onSubmit={handlePost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="border p-2 rounded" placeholder="Food Type (e.g. 5 Curry Packets)" value={foodType} onChange={e => setFoodType(e.target.value)} required />
                    <input className="border p-2 rounded" placeholder="Quantity/Servings" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                    <input className="border p-2 rounded" placeholder="Pickup Location" value={location} onChange={e => setLocation(e.target.value)} required />
                    <input className="border p-2 rounded" type="datetime-local" value={expiry} onChange={e => setExpiry(e.target.value)} />
                    <button className="bg-green-600 text-white p-2 rounded md:col-span-2 font-bold hover:bg-green-700">Post Donation</button>
                </form>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-4">My Donations</h3>
                {posts.length === 0 ? <p className="text-gray-500">No active posts.</p> : (
                    <div className="space-y-3">
                        {posts.map(post => (
                            <div key={post._id} className="border p-3 rounded flex justify-between items-center bg-gray-50">
                                <div>
                                    <p className="font-bold text-lg">{post.food_type}</p>
                                    <p className="text-sm text-gray-600">Qty: {post.quantity} | Loc: {post.location}</p>
                                    <p className={`text-xs font-bold ${post.status === 'Available' ? 'text-green-600' : 'text-orange-600'}`}>Status: {post.status}</p>
                                </div>
                                <button onClick={() => handleDelete(post._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorDashboard;
