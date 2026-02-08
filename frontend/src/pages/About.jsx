import { Link } from 'react-router-dom';
import { Leaf, Users, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

const About = () => {
    return (
        <div className="font-sans bg-white text-gray-800 min-h-screen">
            {/* Navbar (Reused from LandingPage) */}
            <nav className="flex justify-between items-center p-2 px-8 max-w-8xl mx-auto bg-white border-b border-gray-50">
                <div className="text-2xl font-bold flex items-center gap-2">
                    <Leaf className="text-green-600" size={28} />
                    <span className="text-green-700 tracking-tight">Hunger<span className="text-gray-500 font-light">Help</span></span>
                </div>
                <div className="hidden md:flex gap-8 font-extrabold text-sm uppercase tracking-wider text-gray-900">
                    <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
                    <Link to="/about" className="text-green-600">About</Link>
                    <a href="#" className="hover:text-green-600 transition-colors">How it Works</a>
                    <a href="#" className="hover:text-green-600 transition-colors">Contact</a>
                </div>
                <Link to="/login" className="bg-[#41834F] text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-green-800 transition">
                    Login
                </Link>
            </nav>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Our Mission Header */}
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-16 tracking-tight">Our Mission</h1>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-700 aspect-[4/3]">
                        <img
                            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop"
                            alt="Community Gardening"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
                            Reducing Food Waste, <br />
                            Fighting Hunger
                        </h2>
                        <div className="space-y-6 text-gray-500 text-lg leading-relaxed font-medium">
                            <p>
                                A latoryloy Food Wate doru ce m sethe lorshioe asyalunatis domem Hugnly devnge, onth lieze to tue concers with.
                            </p>
                            <p>
                                The ligle in ds ou shewgbtie fix graine tor rematanat outd trotier. The sercors, and in comror 2024/OW riay pho to riodng for dtiynreed the kti etnsots. Coing aand lies tielnitsting Our domoruet, ans dersints lonlorue dang, Vhuy tusliees lte toetiurstlee.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Value Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32 px-4">
                    <ValueCard
                        icon={<Leaf size={32} className="text-green-600" />}
                        title="Sustainability"
                        text="Boeeo instat out vanat set m nos les avalands level sarvings."
                    />
                    <ValueCard
                        icon={<Users size={32} className="text-green-600" />}
                        title="Community"
                        text="Thvuty rot ice istee of hg nilnitans as line lisary"
                    />
                    <ValueCard
                        icon={<Heart size={32} className="text-green-600" />}
                        title="Impact"
                        text="Thvuty rot ice istee of hg nilnitans as line lisary"
                    />
                </div>

                {/* About Missions Section (Timeline) */}
                <div className="mt-40 mb-20">
                    <h3 className="text-2xl font-black text-gray-900 mb-20 px-4">About Missions</h3>

                    <div className="relative pt-20 pb-10">
                        {/* Horizontal Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-200 -translate-y-[62px]"></div>

                        <div className="grid grid-cols-6 gap-2">
                            <TimelineItem year="Founderd" label="Eooooooo" active={true} />
                            <TimelineItem year="Founderd 2024" label="Meeeeee" />
                            <TimelineItem year="Akisssssy" label="Neeeeee" />
                            <TimelineItem year="Larched Updates 2024" label="Reeeeeee" />
                            <TimelineItem year="Endly updates 2024" label="Keeeee" />
                            <div className="relative flex flex-col items-center group">
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-green-600 border-4 border-white shadow-md z-10"></div>
                                <div className="text-center mt-4">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">Recent Deliveries 2024</p>
                                    <p className="text-xs font-bold text-gray-800 mt-1 uppercase">Nutrisoo</p>
                                </div>
                                <div className="mt-8">
                                    <button className="bg-[#41834F] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-green-800 transition-all transform hover:scale-105 active:scale-95">
                                        Claim Meal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">© 2024 HungerHelp. Building a better future together.</p>
            </footer>
        </div>
    );
};

const ValueCard = ({ icon, title, text }) => (
    <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 group">
        <div className="bg-green-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <h4 className="text-xl font-black text-gray-800 mb-4 tracking-tight">{title}</h4>
        <p className="text-sm text-gray-400 font-bold leading-relaxed">{text}</p>
    </div>
);

const TimelineItem = ({ year, label, active = false }) => (
    <div className="relative flex flex-col items-center">
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${active ? 'bg-green-600 ring-4 ring-green-100' : 'bg-green-300'} border-4 border-white shadow-sm z-10 transition-colors`}></div>
        <div className="text-center mt-4 px-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight h-8 flex items-end justify-center">{year}</p>
            <p className="text-xs font-bold text-gray-800 mt-2 uppercase">{label}</p>
        </div>
    </div>
);

export default About;
