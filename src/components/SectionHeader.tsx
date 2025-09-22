import React from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
    return (
        <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                {title}
            </h2>
            {subtitle && <p className="mt-4 text-xl text-zinc-300">{subtitle}</p>}
        </div>
    );
};

export default SectionHeader;