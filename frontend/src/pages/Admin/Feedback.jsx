import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import FeedbackPageContent from '../../components/feedback/FeedbackPageContent';
import { ADMIN_FEEDBACK } from '../../constants/feedbackConfig';

const Feedback = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <FeedbackPageContent config={ADMIN_FEEDBACK} />
            </main>
        </div>
    );
};

export default Feedback;
