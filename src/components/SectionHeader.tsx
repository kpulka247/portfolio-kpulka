import React from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    fileName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, fileName }) => {
    return (
        <div className="mb-10">
            <p className="text-md font-mono text-zinc-600">
                [{fileName}.tsx]
            </p>
            <h2 className="text-4xl font-extrabold text-zinc-300 sm:text-7xl">
                {title}
            </h2>
            {subtitle && <p className="mt-4 text-xl text-zinc-300">{subtitle}</p>}
        </div>
    );
};

export default SectionHeader;