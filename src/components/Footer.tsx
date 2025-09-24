import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-zinc-800 text-white p-6 text-center text-sm z-10">
            <div className="container mx-auto">
                <p>&copy; {currentYear} Kamil Pułka. All rights reserved.</p>
                {/* Social links */}
            </div>
        </footer>
    );
};

export default Footer;