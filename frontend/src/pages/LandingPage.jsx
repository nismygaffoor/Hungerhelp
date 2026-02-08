import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="font-sans bg-white text-gray-800">
            {/* Navbar */}
            <nav className="flex justify-between items-center p-2 px-8 max-w-8xl mx-auto bg-white">
                <div className="text-2xl font-bold flex items-center gap-2">
                    <Leaf className="text-green-600" size={28} />
                    <span className="text-green-700 tracking-tight">Hunger<span className="text-gray-500 font-light">Help</span></span>
                </div>
                <div className="hidden md:flex gap-8 font-extrabold text-lg">
                    <Link to="/" className="hover:text-green-600">Home</Link>
                    <Link to="/about" className="hover:text-green-600">About</Link>
                    <a href="#" className="hover:text-green-600">How it Works</a>
                    <a href="#" className="hover:text-green-600">Contact</a>
                </div>
                <Link to="/login" className="bg-green-700 text-white px-6 py-2 rounded shadow hover:bg-green-800 transition">
                    Login
                </Link>
            </nav>

            {/* Hero Section */}
            <div className="relative  overflow-hidden min-h-[100px] flex flex-col items-center justify-center">
                {/* 1. Background Image (Bottom Layer) */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: "url('/hero-bg.png')" }}
                ></div>

                {/* 2. Color Overlay (Middle Layer) */}
                {/* <div className="absolute inset-0 bg-black opacity-60 z-10"></div> */}

                {/* 3. Content (Top Layer) */}
                <div className="relative  z-20 max-w-7xl mx-auto px-6 py-32 flex flex-col items-center text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
                        Reducing Food Waste, <br />
                        Fighting Hunger.
                    </h1>

                    <p className="text-xl mb-8 max-w-xl drop-shadow-md">
                        Connect with local communities to redistribute surplus food to those in need. Join our mission today.
                    </p>

                    <Link
                        to="/register"
                        className="bg-green-600 hover:bg-green-700 text-white text-lg font-bold px-10 py-4 rounded-xl shadow-2xl transition transform hover:scale-105"
                    >
                        Join Now
                    </Link>
                </div>
            </div>
            {/* Stats Section */}
            <div className="relative z-20  -mt-20 max-w-5xl mx-auto px-0">
                <div className="bg-orange-400 rounded-lg shadow-xl p-8 flex flex-col md:flex-row justify-between items-center text-center text-gray-900">
                    <div className="mb-6 md:mb-0">
                        <p className="text-sm font-bold opacity-60 uppercase mb-1">Impact</p>
                        <p className="text-4xl font-bold">15,400</p>
                        <p className="text-sm">Meals Saved</p>
                    </div>
                    <div className="w-px h-16 bg-black opacity-10 hidden md:block"></div>
                    <div className="mb-6 md:mb-0">
                        <p className="text-sm font-bold opacity-60 uppercase mb-1">Community</p>
                        <p className="text-4xl font-bold">350</p>
                        <p className="text-sm">Registered Donors</p>
                    </div>
                    <div className="w-px h-16 bg-black opacity-10 hidden md:block"></div>
                    <div>
                        <p className="text-sm font-bold opacity-60 uppercase mb-1">Reach</p>
                        <p className="text-4xl font-bold">50</p>
                        <p className="text-sm">Communities Fed</p>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="pt-10 pb-20 bg-white text-center">
                <h2 className="text-3xl font-bold mb-16">How it Works</h2>
                <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-5">

                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                        <div className="bg-orange-100 p-6 rounded-full w-40 h-40 flex items-center justify-center mb-6">
                            <span className="text-6xl">🍲</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Post Food</h3>
                        <p className="text-gray-600 max-w-xs">Donors list surplus food details including quantity and pickup location.</p>
                    </div>

                    {/* Arrow (Hidden on mobile) */}
                    <div className="hidden md:flex items-center justify-center pt-10">
                        <span className="text-4xl mb-20">➜</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                        <div className="bg-orange-100 p-6 rounded-full w-40 h-40 flex items-center justify-center mb-6">
                            <span className="text-6xl">🛵</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Volunteer Delivers</h3>
                        <p className="text-gray-600 max-w-xs">Volunteers accept the task and transport food to the beneficiary.</p>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center justify-center pt-10">
                        <span className="text-4xl mb-20">➜</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                        <div className="bg-orange-100 p-6 rounded-full w-40 h-40 flex items-center justify-center mb-6">
                            <span className="text-6xl">👨‍👩‍👧‍👦</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Beneficiary Eats</h3>
                        <p className="text-gray-600 max-w-xs">Communities receive the food, reducing waste and fighting hunger.</p>
                    </div>

                </div>
            </div>

            <footer className="bg-gray-900 text-white py-8 text-center">
                <p>© 2026 HungerHelp. Building a better future together.</p>
            </footer>
        </div >
    );
};

export default LandingPage;
