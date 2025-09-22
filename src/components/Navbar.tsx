import React, { useState } from 'react';
import { navigationItems } from '../config/navigation';
import ScrollLink from './ScrollLink';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-zinc-800 p-4 fixed w-full z-50 shadow-md">
            <div className="container mx-auto flex justify-center items-center">

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                        </svg>
                    </button>
                </div>

                {/* Desktop menu */}
                <ul className="hidden md:flex space-x-6">
                    {navigationItems.map((item) => (
                        <li key={item.id}>
                            <ScrollLink
                                to={item.id}
                                className="text-white hover:text-zinc-400 transition-colors text-lg"
                            >
                                {item.name}
                            </ScrollLink>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mobile menu dropdown */}
            {isOpen && (
                <div className="md:hidden bg-zinc-700 mt-2 rounded-md shadow-lg">
                    <ul className="flex flex-col space-y-2 p-4">
                        {navigationItems.map((item) => (
                            <li key={item.id}>
                                <ScrollLink
                                    to={item.id}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-white hover:text-zinc-400 transition-colors text-lg py-2"
                                >
                                    {item.name}
                                </ScrollLink>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;