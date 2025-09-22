import React from 'react';
import SectionHeader from '../components/SectionHeader';

const Contact: React.FC = () => {
    return (
        <section id="contact" className="bg-zinc-900 py-20 text-white">
            <div className="container mx-auto px-4 max-w-2xl">
                <SectionHeader title="Get In Touch" subtitle="Have a question or want to collaborate?" />
                <p className="text-lg text-zinc-300 text-center mb-8">
                    I'm always open to new opportunities and interesting projects. Feel free to reach out!
                </p>
                <div className="text-center">
                    <a
                        href="mailto:contact@kpulka.com"
                        className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block text-xl"
                    >
                        Email Me
                    </a>
                </div>
                <div className="flex justify-center space-x-6 mt-10">
                </div>
            </div>
        </section>
    );
};

export default Contact;