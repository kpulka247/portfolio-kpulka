import { useState, useEffect } from "react";

const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkIsTouch = (): void => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;
      const isNotDesktop = window.matchMedia(
        "(hover: none), (pointer: coarse)"
      ).matches;

      setIsTouch(hasTouch && (isSmallScreen || isNotDesktop));
    };

    checkIsTouch();

    window.addEventListener("resize", checkIsTouch);

    return () => {
      window.removeEventListener("resize", checkIsTouch);
    };
  }, []);

  return isTouch;
};

export default useIsTouchDevice;
