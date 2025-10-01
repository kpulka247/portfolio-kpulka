import React, { useState, Suspense, useRef, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Canvas } from '@react-three/fiber';
import { InteractiveCard } from '../components/InteractiveCard';
import { MovingLight } from '../components/MovingLight';
import { BsPersonFill, BsStarFill, BsArrowRepeat } from "react-icons/bs";

interface Project {
    id: number;
    title: string;
    shortDescription: string;
    description: string;
    techStack: string[];
    githubLink?: string;
    chromeExtensionId?: string;
    firefoxExtensionId?: string;
}

const projects: Project[] = [
    {
        id: 1,
        title: 'Dark Connect',
        shortDescription: 'Dark mode for Garmin Connect website that replaces light colors with their dark theme.',
        description: 'This is a simple browser extension designed to turn the Garmin Connect website into dark mode. Frustrated by the lack of a dark mode feature on Garmin Connect, I created this extension to enhance the browsing experience for users who prefer a darker interface, especially during nighttime use. The extension is lightweight, easy to to install, and only affects Garmin Connect domains, leaving all other websites untouched.',
        techStack: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Webpack'],
        githubLink: 'https://github.com/kpulka247/dark-connect',
        chromeExtensionId: 'nadhhgppikppmjacnkebagbgcibnfnob',
        firefoxExtensionId: 'dark-connect'
    },
    {
        id: 2,
        title: 'StudentOffers',
        shortDescription: 'A full-stack application with a Django backend and a responsive React frontend.',
        description: 'The site was created using React.js and Django. It is a continuation of my original project of a website with offers for students, which was part of my Engineering Thesis. The site will be further developed, as it is also a project for learning new skills as well as testing different solutions.',
        techStack: ['React.js', 'Django', 'JavaScript', 'Tailwind CSS', 'HTML5', 'CSS3'],
        githubLink: 'https://github.com/kpulka247/studentoffers',
    },
];

const Projects: React.FC = () => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isCanvasVisible, setIsCanvasVisible] = useState(false);

    const canvasContainerRef = useRef<HTMLDivElement>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

    const handleProjectSelect = (projectId: number) => {
        setSelectedProjectId(prevId => (prevId === projectId ? null : projectId));
        setIsFlipped(false);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsCanvasVisible(entry.isIntersecting);
            },
            {
                threshold: 0,
            }
        );

        const currentContainer = canvasContainerRef.current;
        if (currentContainer) {
            observer.observe(currentContainer);
        }

        return () => {
            if (currentContainer) {
                observer.unobserve(currentContainer);
            }
        };
    }, []);

    return (
        <section id="projects" className="py-10 md:py-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="md:col-span-1 flex flex-col items-center md:items-end">
                        <div className="text-center md:text-right mb-6">
                            <SectionHeader
                                title="PROJECTS"
                                subtitle="Click on a project to see the details."
                                fileName="Projects"
                            />
                        </div>
                        <ul className="w-full">
                            {projects.map((project) => (
                                <li key={project.id} className="flex flex-col items-center md:items-end">
                                    <button
                                        onClick={() => handleProjectSelect(project.id)}
                                        className={`font-mono py-4 text-lg transition-all duration-300 cursor-pointer
                                            ${selectedProjectId === project.id ? 'text-white font-bold' : 'hover:text-white'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            {project.chromeExtensionId && (
                                                <div className="flex items-center justify-center">
                                                    <BsPersonFill size={16} className="mr-1" />
                                                    <img
                                                        src={`https://img.shields.io/chrome-web-store/users/${project.chromeExtensionId}?style=flat-square&label=&color=black`}
                                                        alt="Chrome Web Store Users"
                                                        style={{ height: '20px' }}
                                                    />
                                                    <BsStarFill size={16} className="mx-1" />
                                                    <img
                                                        src={`https://img.shields.io/chrome-web-store/rating/${project.chromeExtensionId}?style=flat-square&label=&color=black`}
                                                        alt="Chrome Web Store Users"
                                                        style={{ height: '20px' }}
                                                    />
                                                </div>
                                            )}
                                            {project.title}
                                        </div>
                                    </button>
                                    <div
                                        className={`overflow-hidden text-center md:text-right transition-all duration-300 ease-in-out
                                            ${selectedProjectId === project.id ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                                        `}
                                    >
                                        <div className="flex justify-center md:justify-end text-sm font-mono gap-3">
                                            {project.chromeExtensionId && (
                                                <a
                                                    href={`https://chrome.google.com/webstore/detail/${project.chromeExtensionId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-zinc-600 hover:text-white underline pb-4"
                                                    title="Chrome Web Store"
                                                >
                                                    Chrome
                                                </a>
                                            )}
                                            {project.firefoxExtensionId && (
                                                <a
                                                    href={`https://addons.mozilla.org/firefox/addon/${project.firefoxExtensionId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-zinc-600 hover:text-white underline pb-4"
                                                    title="Firefox Add-ons"
                                                >
                                                    Firefox
                                                </a>
                                            )}
                                        </div>
                                        <p className="pb-4 text-md">
                                            {project.description}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div ref={canvasContainerRef} className="md:col-span-1 flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px]">
                        <div className="w-full h-full relative">
                            <Canvas
                                camera={{ position: [0, 0, 9], fov: 52 }}
                                frameloop={isCanvasVisible ? 'always' : 'never'}
                            >
                                <directionalLight position={[20, 7, -5]} intensity={0.4} />
                                <rectAreaLight
                                    width={20}
                                    height={20}
                                    intensity={6}
                                    color="#ffffff"
                                    position={[-10, 10, 10]}
                                />
                                <Suspense fallback={null}>
                                    <InteractiveCard project={selectedProject} isFlipped={isFlipped} isVisible={isCanvasVisible} />
                                    <MovingLight />
                                </Suspense>
                            </Canvas>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => setIsFlipped(prev => !prev)}
                                className="p-2 hover:text-white transition-all duration-300 cursor-pointer"
                                style={{ transform: isFlipped ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                aria-label="Flip Card"
                                title="Flip Card"
                            >
                                <BsArrowRepeat className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;