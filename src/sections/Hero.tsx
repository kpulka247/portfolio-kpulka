import React from 'react';
import ScrollLink from '../components/ScrollLink';

const Hero: React.FC = () => {
    return (
        <section id="hello" className="h-screen flex items-center justify-center bg-white text-black">
            <div className="container mx-auto text-center px-4">
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4">
                    Hi, I'm <span className="text-zinc-400">Kamil Pułka</span>
                </h1>
                <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                    A passionate web developer specializing in building modern web applications.
                </p>
                <div className="space-x-4">
                    <ScrollLink
                        to="projects"
                        className="bg-zinc-600 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block"
                    >
                        View My Work
                    </ScrollLink>
                    <ScrollLink
                        to="contact"
                        className="border-2 border-zinc-600 text-zinc-400 hover:text-zinc-200 hover:border-zinc-400 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 inline-block"
                    >
                        Contact Me
                    </ScrollLink>
                </div>
            </div>
        </section>
    );
};

export default Hero;