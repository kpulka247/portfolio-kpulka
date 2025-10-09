import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactGA from "react-ga4";
import { Link } from "react-router-dom";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleDecision = (consent: "granted" | "denied") => {
    ReactGA.gtag("consent", "update", {
      analytics_storage: consent,
    });

    localStorage.setItem("cookie_consent", consent);

    setIsVisible(false);

    if (consent === "granted") {
      ReactGA.event({
        category: "Consent",
        action: "granted",
        label: "User granted cookie consent",
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed bottom-0 left-0 right-0 bg-zinc-800 text-zinc-300 p-4 z-50 flex flex-col md:flex-row justify-center items-center gap-4"
        >
          <p className="text-sm text-center">
            We use cookies to analyze website traffic. Your consent helps us
            improve this page.
          </p>

          <div className="flex flex-row justify-center items-center gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => handleDecision("denied")}
                className="px-4 py-1.5 rounded-full bg-transparent border-2 text-zinc-300 border-zinc-300 hover:border-white hover:text-white transition-colors text-sm cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleDecision("granted")}
                className="px-4 py-1.5 rounded-full bg-white text-black font-bold hover:bg-zinc-300 transition-colors text-sm cursor-pointer"
              >
                Accept
              </button>
            </div>
            <Link
              to="/privacy"
              className="text-sm hover:text-white text-center underline"
            >
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
