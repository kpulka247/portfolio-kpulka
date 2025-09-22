import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';

interface Project {
    id: number;
    title: string;
    description: string;
    techStack: string[];
    githubLink?: string;
    demoLink?: string;
}

const projects: Project[] = [
    {
        id: 1,
        title: 'Project A',
        description: 'Description.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'GitHub Actions'],
        githubLink: 'https://github.com/kpulka247/portfolio-kpulka',
    },
    {
        id: 2,
        title: 'Project B',
        description: 'Description.',
        techStack: ['React', 'Django', 'JavaScript', 'Tailwind CSS'],
        githubLink: '#',
        demoLink: '#',
    },
    {
        id: 3,
        title: 'Project C',
        description: 'Description.',
        techStack: ['JavaScript', 'HTML', 'CSS'],
        githubLink: '#',
    },
];

const Projects: React.FC = () => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <section id="projects" className="bg-zinc-800 py-20 text-white">
            <div className="container mx-auto px-4 max-w-6xl">
                <SectionHeader title="My Projects" subtitle="Click on a project to see the details" />

                <div className="grid md:grid-cols-2 gap-10">

                    <div className="md:col-span-1 flex items-center">
                        <ul className="space-y-4 w-full">
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <button
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={`w-full text-left p-4 rounded-md text-lg
                                            ${selectedProjectId === project.id
                                                ? 'bg-zinc-600 text-white font-bold shadow-lg'
                                                : 'bg-zinc-700 hover:bg-zinc-600 hover:text-white'
                                            }`
                                        }
                                    >
                                        {project.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-1 flex items-center justify-end">

                        {selectedProject ? (
                            <div className="bg-zinc-700 p-8 rounded-xl shadow-2xl w-full max-w-xs aspect-[10/16] flex flex-col justify-between">
                                <div>
                                    <h3 className="text-4xl font-extrabold text-zinc-400 mb-4">{selectedProject.title}</h3>
                                    <p className="text-zinc-300 text-lg mb-6">{selectedProject.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedProject.techStack.map((tech, idx) => (
                                            <span key={idx} className="bg-zinc-600 text-white text-sm px-3 py-1 rounded-full">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-4 mt-auto">
                                    {selectedProject.githubLink && (
                                        <a href={selectedProject.githubLink} target="_blank" rel="noopener noreferrer" className="bg-zinc-800 hover:bg-black text-white font-semibold py-2 px-5 rounded-full w-full text-center">
                                            GitHub
                                        </a>
                                    )}
                                    {selectedProject.demoLink && (
                                        <a href={selectedProject.demoLink} target="_blank" rel="noopener noreferrer" className="bg-zinc-600 hover:bg-zinc-700 text-white font-semibold py-2 px-5 rounded-full w-full text-center">
                                            Live Demo
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-700 p-8 rounded-xl w-full max-w-xs aspect-[10/16] flex items-center justify-center border-4 border-dashed border-zinc-600">
                                <span className="text-9xl text-zinc-600 font-bold">?</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Projects;