import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../components/SectionHeader';
import { skillCategories } from '../data/skills';
import { staggerContainer, staggerItem } from '../utils/animations';

const allSkills = skillCategories.flatMap(category => category.skills);

const Skills: React.FC = () => {
    const [hoveredSkillName, setHoveredSkillName] = React.useState<string | null>(null);
    const [hoveredSliderIndex, setHoveredSliderIndex] = React.useState<number | null>(null);
    const duplicatedSkills = [...allSkills, ...allSkills];

    return (
        <section id="skills" className="py-10 md:py-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center">
                    <SectionHeader
                        title="SKILLS"
                        subtitle="Technologies I work with."
                        fileName="Skills"
                    />
                </div>

                <div
                    className="overflow-hidden flex relative h-16 items-center mt-10 md:mt-20"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                    }}
                >
                    <div
                        className="flex gap-16 animate-loop-scroll">
                        {duplicatedSkills.map((skill, index) => (
                            <motion.div
                                key={index}
                                className="mx-2"
                                animate={
                                    hoveredSliderIndex === index % allSkills.length
                                        ? { color: '#fff', scale: 1.2 }
                                        : { color: '#27272a', scale: 1 }
                                }
                            >
                                {skill.icon}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-10 md:mt-20 flex flex-col items-center text-center gap-y-12 md:flex-row md:items-start md:text-left md:justify-center md:gap-x-16 lg:gap-x-24">
                    {skillCategories.map((category, index) => (
                        <motion.div
                            key={category.title}
                            className={index === 1 ? 'md:mt-10' : index === 2 ? 'md:mt-20' : ''}
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            <h3 className="mb-5 text-lg font-semibold tracking-widest text-zinc-600">
                                {category.title}
                            </h3>
                            <ul className="space-y-4">
                                {category.skills.map(skill => (
                                    <motion.li key={skill.name} variants={staggerItem}>
                                        <motion.a
                                            href={skill.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono cursor-pointer text-md tracking-wide inline-block relative"
                                            onMouseEnter={() => {
                                                setHoveredSkillName(skill.name);
                                                const sliderIndex = allSkills.findIndex(s => s.name === skill.name);
                                                setHoveredSliderIndex(sliderIndex);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredSkillName(null);
                                                setHoveredSliderIndex(null);
                                            }}
                                            animate={{ color: hoveredSkillName === skill.name ? '#fff' : '#d4d4d8' }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {skill.name}
                                            <motion.span
                                                className="absolute left-0 -bottom-1 h-[2px] bg-white rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: hoveredSkillName === skill.name ? '100%' : 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            />
                                        </motion.a>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;