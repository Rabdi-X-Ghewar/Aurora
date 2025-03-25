import { Wallet, Search, Bell, Menu } from 'lucide-react';
import Login from './Login';

const Navbar = () => {
    return (
        <nav className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-gray-200 h-16 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center group cursor-pointer">
                        <div className="transform group-hover:rotate-12 transition-transform duration-300">
                            <Wallet className="h-8 w-8 text-indigo-600" />
                        </div>
                        <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            AURORA
                        </span>
                    </div>

                    {/* Navigation Links - Hidden on Mobile */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                            Dashboard
                        </a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                            Transactions
                        </a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                            Analytics
                        </a>
                    </div>

                    {/* Right Side Icons and Login */}
                    <div className="flex items-center space-x-6">
                        {/* Search Button */}
                        <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200">
                            <Search className="h-5 w-5" />
                        </button>

                        {/* Notifications */}
                        <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Login Button */}
                        <Login name='Log In'/>

                        {/* Mobile Menu Button */}
                        <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 md:hidden">
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;