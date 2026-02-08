import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const Requests = () => {
    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0">
                <Navbar />
                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Food Request Management</h2>
                        <p className="text-gray-500 text-sm mt-1">Review and coordinate food requests from beneficiaries in need.</p>
                    </header>
                    <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Community Requests</h3>
                        <p className="text-gray-500">Review and coordinate food requests from beneficiaries in need.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Requests;
