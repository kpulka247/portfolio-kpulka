import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-black font-mono text-zinc-600 p-6 text-sm z-10">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-2 text-center">

                <div className="md:text-left">
                    <Link to="/" className="hover:text-white underline">
                        Home
                    </Link>
                </div>

                <div>
                    <p>&copy; {currentYear} kpulka.com</p>
                </div>

                <div className="md:text-right">
                    <Link to="/privacy" className="hover:text-white underline">
                        Privacy Policy
                    </Link>
                </div>

            </div>
        </footer>
    );
};

export default Footer;