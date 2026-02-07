import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, User, Heart, Truck } from 'lucide-react';

const Register = () => {
    const [selectedRole, setSelectedRole] = useState('Donor');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        contact: '',
        address: '',
        businessName: '',
        beneficiaryType: '',
        language: '',
        experience: ''
    });
    const [error, setError] = useState('');
    const { registerUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Merge standard fields with role-specific notes for the backend if needed
        // For this demo, we'll just send everything
        const payload = {
            ...formData,
            role: selectedRole
        };

        const res = await registerUser(payload);
        if (res.success) {
            navigate('/login');
        } else {
            setError(res.message);
        }
    };

    // Role-specific config
    const roleContent = {
        Donor: {
            title: "Become a Donor",
            slogan: "Share Surplus, nourish lives.",
            icon: <Heart size={20} />,
            color: "border-green-600 bg-green-50 text-green-700"
        },
        Beneficiary: {
            title: "Become a Beneficiary",
            slogan: "Nourishing communities together",
            icon: <User size={20} />,
            color: "border-blue-600 bg-blue-50 text-blue-700"
        },
        Volunteer: {
            title: "Become a Volunteer",
            slogan: "Deliver Hope, Save Food.",
            icon: <Truck size={20} />,
            color: "border-orange-600 bg-orange-50 text-orange-700"
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gray-50 overflow-hidden py-10">

            {/* Background Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-80"
                style={{ backgroundImage: "url('/login-bg.png')" }}
            ></div>

            {/* Register Card */}
            <div className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg mx-4 border border-white/50 backdrop-blur-sm bg-white/95">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Leaf className="text-green-600" size={28} />
                        <span className="text-2xl font-bold text-green-700 tracking-tight">Hunger<span className="text-gray-500 font-light">Help</span></span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif font-bold text-gray-700">{roleContent[selectedRole].title}</h2>
                    <p className="text-sm text-green-600 font-medium mt-1">{roleContent[selectedRole].slogan}</p>
                </div>

                {/* Role Switcher */}
                <div className="flex justify-center gap-3 mb-8">
                    {Object.keys(roleContent).map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`flex flex-col items-center gap-1 min-w-[90px] py-2 px-1 rounded-2xl border-2 transition-all group
                                ${selectedRole === role
                                    ? roleContent[role].color
                                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                            <div className={`p-2 rounded-full transition-colors ${selectedRole === role ? 'bg-white/50' : 'bg-gray-50'}`}>
                                {roleContent[role].icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{role}</span>
                        </button>
                    ))}
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 mb-6 rounded-lg text-sm text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField placeholder="Full Name" name="name" value={formData.name} onChange={handleChange} />

                    {selectedRole === 'Donor' && (
                        <InputField placeholder="Business Name (optional)" name="businessName" value={formData.businessName} onChange={handleChange} />
                    )}

                    <InputField placeholder="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <InputField placeholder="Phone Number" name="contact" type="tel" value={formData.contact} onChange={handleChange} />

                    {selectedRole === 'Beneficiary' && (
                        <>
                            <InputField placeholder="Beneficiary Type (e.g. Charity, Individual)" name="beneficiaryType" value={formData.beneficiaryType} onChange={handleChange} />
                            <InputField placeholder="Address" name="address" value={formData.address} onChange={handleChange} />
                            <InputField placeholder="Language preference" name="language" value={formData.language} onChange={handleChange} />
                        </>
                    )}

                    {selectedRole === 'Volunteer' && (
                        <InputField placeholder="Experience (if any)" name="experience" value={formData.experience} onChange={handleChange} />
                    )}

                    <InputField placeholder="Password" name="password" type="password" value={formData.password} onChange={handleChange} />

                    <button
                        type="submit"
                        className="w-full bg-[#1E5144] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#163d33] transition-all transform active:scale-95 text-lg mt-6"
                    >
                        SIGN UP TO HELP
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">
                        Already have account? <Link to="/login" className="text-green-700 font-bold hover:underline">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ placeholder, name, type = "text", value, onChange }) => (
    <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full border-b-2 border-gray-100 py-2 px-2 focus:outline-none focus:border-green-600 transition-colors text-base"
        value={value}
        onChange={onChange}
        required={name !== 'businessName' && name !== 'experience'}
    />
);

export default Register;
