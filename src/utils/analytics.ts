import ReactGA from "react-ga4";

export const trackEvent = (category: string, action: string, label?: string) => {
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
        ReactGA.event({
            category: category,
            action: action,
            label: label,
        });
    }
};