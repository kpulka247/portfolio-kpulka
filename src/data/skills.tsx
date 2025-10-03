import type { SkillCategory } from '../types/skill';

import { FaReact, FaGitAlt } from 'react-icons/fa';
import {
    SiTypescript, SiTailwindcss, SiWebpack, SiVite, SiDjango,
    SiJavascript, SiHtml5, SiCss3, SiThreedotjs, SiGithubactions,
    SiPostgresql, SiBootstrap,
} from 'react-icons/si';

export const skillCategories: SkillCategory[] = [
    {
        title: 'Frontend & UI',
        skills: [
            { name: 'React.js', url: 'https://react.dev/', icon: <FaReact size={30} /> },
            { name: 'TypeScript', url: 'https://www.typescriptlang.org/', icon: <SiTypescript size={30} /> },
            { name: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', icon: <SiJavascript size={30} /> },
            { name: 'Three.js', url: 'https://threejs.org/', icon: <SiThreedotjs size={30} /> },
            { name: 'HTML5', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', icon: <SiHtml5 size={30} /> },
            { name: 'CSS3', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', icon: <SiCss3 size={30} /> },
            { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', icon: <SiTailwindcss size={30} /> },
            { name: 'Bootstrap', url: 'https://getbootstrap.com/', icon: <SiBootstrap size={30} /> },
        ],
    },
    {
        title: 'Backend',
        skills: [
            { name: 'Django', url: 'https://www.djangoproject.com/', icon: <SiDjango size={30} /> },
            { name: 'PostgreSQL', url: 'https://www.postgresql.org/', icon: <SiPostgresql size={30} /> },
        ],
    },
    {
        title: 'Tools & DevOps',
        skills: [
            { name: 'Webpack', url: 'https://webpack.js.org/', icon: <SiWebpack size={30} /> },
            { name: 'Vite', url: 'https://vitejs.dev/', icon: <SiVite size={30} /> },
            { name: 'Git', url: 'https://git-scm.com/', icon: <FaGitAlt size={30} /> },
            { name: 'GitHub Actions', url: 'https://github.com/features/actions', icon: <SiGithubactions size={30} /> },
        ],
    },
];