import React from 'react';
import SectionHeader from '../components/SectionHeader';

const skills = [
    { name: 'React'},
    { name: 'TypeScript'},
    { name: 'Tailwind CSS'},
    { name: 'Webpack'},
    { name: 'Vite'},
    { name: 'Django'},
    { name: 'Git'},
    { name: 'CI/CD'},
];

const Skills: React.FC = () => {
    return (
        <section id="skills" className="bg-zinc-900 py-20 text-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <SectionHeader title="My Skills" subtitle="Technologies I work with" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="bg-zinc-800 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300"
                        >
                            <h3 className="text-xl font-semibold text-white">{skill.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;