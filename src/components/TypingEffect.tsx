import React, { useState, useEffect } from 'react';

const TEXTS_TO_TYPE = ["Kamil Pułka", "kpulka247", "Web Developer"];
const TYPING_SPEED_MS = 120;
const DELETING_SPEED_MS = 70;
const PAUSE_DURATION_MS = 3000;

const TypingEffect: React.FC = () => {
    const [textIndex, setTextIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        setDisplayText(TEXTS_TO_TYPE[textIndex].substring(0, subIndex));

        if (subIndex === 0 && isDeleting) {
            setIsDeleting(false);
            setTextIndex((prevIndex) => (prevIndex + 1) % TEXTS_TO_TYPE.length);
            return;
        }

        if (subIndex === TEXTS_TO_TYPE[textIndex].length && !isDeleting) {
            setTimeout(() => setIsDeleting(true), PAUSE_DURATION_MS);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prevSubIndex) => prevSubIndex + (isDeleting ? -1 : 1));
        }, isDeleting ? DELETING_SPEED_MS : TYPING_SPEED_MS);

        return () => clearTimeout(timeout);
    }, [subIndex, isDeleting, textIndex]);


    return (
        <>
            {displayText}
            <span className="blinking-cursor">.</span>
        </>
    );
};

export default TypingEffect;