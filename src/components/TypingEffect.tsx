import React from 'react';

interface TypingEffectProps {
    text: string;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text }) => {
    return (
        <>
            {text}
            <span className="blinking-cursor">.</span>
        </>
    );
};

export default TypingEffect;