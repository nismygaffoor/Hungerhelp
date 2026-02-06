import { useState, useEffect } from 'react';
import api from '../api/axios';

const VolunteerDashboard = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/delivery/');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.post(`/delivery/${id}/accept`);
            alert("Task accepted!");
            fetchTasks();
        } catch (err) {
            alert("Failed to accept task");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-4 text-blue-700">Available Deliveries</h3>
                {tasks.length === 0 ? <p className="text-gray-500">No pending deliveries.</p> : (
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task._id} className="border p-4 rounded flex flex-col md:flex-row justify-between bg-blue-50">
                                <div>
                                    <p className="font-bold">Pickup: <span className="font-normal">{task.pickup_location}</span></p>
                                    <p className="font-bold">Dropoff: <span className="font-normal">{task.dropoff_location}</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Posted: {new Date(task.created_at).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleAccept(task._id)}
                                    className="mt-2 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Accept Delivery
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;
