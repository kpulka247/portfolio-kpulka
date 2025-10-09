import { useState, useEffect } from "react";

const TEXTS_TO_TYPE = [
  "Kamil Pułka",
  "Web Developer",
  "kpulka247",
  "UI/UX Designer",
];
const TYPING_SPEED_MS = 120;
const DELETING_SPEED_MS = 70;
const PAUSE_DURATION_MS = 3000;

export const useTypingEffect = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (subIndex === TEXTS_TO_TYPE[textIndex].length && !isDeleting) {
      const timer = setTimeout(() => setIsDeleting(true), PAUSE_DURATION_MS);
      return () => clearTimeout(timer);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % TEXTS_TO_TYPE.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
      },
      isDeleting ? DELETING_SPEED_MS : TYPING_SPEED_MS
    );

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, textIndex]);

  useEffect(() => {
    const currentText = TEXTS_TO_TYPE[textIndex];
    setDisplayText(currentText.substring(0, subIndex));
  }, [subIndex, textIndex]);

  return displayText;
};
