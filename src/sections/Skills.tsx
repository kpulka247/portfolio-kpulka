import React, { useState } from 'react';
import { FaReact, FaGitAlt } from 'react-icons/fa';
import {
    SiTypescript,
    SiTailwindcss,
    SiWebpack,
    SiVite,
    SiDjango,
    SiJavascript,
    SiHtml5,
    SiCss3,
    SiThreedotjs,
    SiGithubactions,
} from 'react-icons/si';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';

const skills = [
    { name: 'React.js', icon: <FaReact size={30} />, url: 'https://react.dev/' },
    { name: 'TypeScript', icon: <SiTypescript size={30} />, url: 'https://www.typescriptlang.org/' },
    { name: 'JavaScript', icon: <SiJavascript size={30} />, url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
    { name: 'Django', icon: <SiDjango size={30} />, url: 'https://www.djangoproject.com/' },
    { name: 'Git', icon: <FaGitAlt size={30} />, url: 'https://git-scm.com/' },
    { name: 'Webpack', icon: <SiWebpack size={30} />, url: 'https://webpack.js.org/' },
    { name: 'Vite', icon: <SiVite size={30} />, url: 'https://vitejs.dev/' },
    { name: 'HTML5', icon: <SiHtml5 size={30} />, url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
    { name: 'CSS3', icon: <SiCss3 size={30} />, url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
    { name: 'Tailwind CSS', icon: <SiTailwindcss size={30} />, url: 'https://tailwindcss.com/' },
    { name: 'Three.js', icon: <SiThreedotjs size={30} />, url: 'https://threejs.org/' },
    { name: 'GitHub Actions', icon: <SiGithubactions size={30} />, url: 'https://github.com/features/actions' },
];

const Skills: React.FC = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section id="skills" className="bg-black py-20 text-white">
            <div className="container mx-auto px-4 max-w-5xl">
                <SectionHeader title="Skills" subtitle="Technologies I work with." />

                <div className="overflow-hidden relative h-16 mt-20"
                    style={{
                        WebkitMaskImage:
                            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                        maskImage:
                            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                    }}
                >
                    <motion.div
                        className="flex absolute gap-8 whitespace-nowrap"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                    >
                        {[...skills, ...skills].map((skill, index) => (
                            <motion.div
                                key={index}
                                className={`mx-2`}
                                animate={
                                    hoveredIndex === index % skills.length
                                        ? { color: '#fff', scale: 1.2 }
                                        : { color: '#27272a', scale: 1 }
                                }
                            >
                                {skill.icon}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                    {skills.map((skill, index) => (
                        <div key={index} className="flex justify-center">
                            <motion.a
                                href={skill.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer text-sm tracking-wide inline-block relative"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                animate={{ color: hoveredIndex === index ? '#fff' : '#d4d4d8' }}
                                transition={{ duration: 0.3 }}
                            >
                                {skill.name}
                                <motion.span
                                    className="absolute left-0 -bottom-1 h-[2px] bg-white rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: hoveredIndex === index ? '100%' : 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                />
                            </motion.a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
