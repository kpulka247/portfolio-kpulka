import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-black font-mono text-zinc-600 p-6 text-center text-sm z-10">
            <div className="container mx-auto">
                <p>&copy; {currentYear} kpulka.com</p>
            </div>
        </footer>
    );
};

export default Footer;