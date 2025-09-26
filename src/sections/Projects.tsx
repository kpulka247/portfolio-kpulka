import React, { useState, Suspense } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Canvas } from '@react-three/fiber';
import { InteractiveCard } from '../components/InteractiveCard';
import { MovingLight } from '../components/MovingLight';

interface Project {
    id: number;
    title: string;
    shortDescription: string;
    description: string;
    techStack: string[];
    githubLink?: string;
}

const projects: Project[] = [
    {
        id: 1,
        title: 'Dark Connect',
        shortDescription: 'Dark mode for Garmin Connect website that replaces light colors with their dark theme.',
        description: 'This is a simple browser extension designed to turn the Garmin Connect website into dark mode. Frustrated by the lack of a dark mode feature on Garmin Connect, I created this extension to enhance the browsing experience for users who prefer a darker interface, especially during nighttime use. The extension is lightweight, easy to install, and only affects Garmin Connect domains, leaving all other websites untouched.',
        techStack: ['React.js', 'JavaScript', 'HTML', 'CSS', 'Webpack'],
        githubLink: 'https://github.com/kpulka247/dark-connect',
    },
    {
        id: 2,
        title: 'StudentOffers',
        shortDescription: 'A full-stack application with a Django backend and a responsive React frontend.',
        description: 'The site was created using React.js and Django. It is a continuation of my original project of a website with offers for students, which was part of my Engineering Thesis. The site will be further developed, as it is also a project for learning new skills as well as testing different solutions.',
        techStack: ['React.js', 'Django', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS'],
        githubLink: 'https://github.com/kpulka247/studentoffers',
    },
];

const Projects: React.FC = () => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

    const handleProjectSelect = (projectId: number) => {
        setSelectedProjectId(prevId => (prevId === projectId ? null : projectId));
        setIsFlipped(false);
    };

    return (
        <section id="projects" className="bg-black py-20 text-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <SectionHeader title="Projects" subtitle="Click on a project to see the details." />
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="md:col-span-1 flex justify-center items-center">
                        <ul className="text-zinc-300 w-2/3">
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <button
                                        onClick={() => handleProjectSelect(project.id)}
                                        className={`w-full text-right p-4 text-lg transition-all duration-300 cursor-pointer
          ${selectedProjectId === project.id ? 'text-white font-bold' : 'hover:text-white'
                                            }`}
                                    >
                                        {project.title}
                                    </button>
                                    <div
                                        className={`overflow-hidden text-right transition-all duration-300 ease-in-out
          ${selectedProjectId === project.id ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
                                    >
                                        <p className="px-4 pb-4 text-sm text-gray-300">
                                            {project.description}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-1 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px]">
                        <div className="w-full h-full relative">
                            <Canvas camera={{ position: [0, 0, 9], fov: 50 }}>
                                <directionalLight position={[20, 7, -5]} intensity={0.4} />
                                <rectAreaLight
                                    width={20}
                                    height={20}
                                    intensity={6}
                                    color="#ffffff"
                                    position={[-10, 10, 10]}
                                />
                                <Suspense fallback={null}>
                                    <InteractiveCard project={selectedProject} isFlipped={isFlipped} />
                                    <MovingLight />
                                </Suspense>
                            </Canvas>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => setIsFlipped(prev => !prev)}
                                className="p-2 text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer"
                                style={{ transform: isFlipped ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                aria-label="Flip Card"
                                title="Flip Card"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;