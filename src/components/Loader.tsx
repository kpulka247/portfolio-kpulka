import { motion } from "framer-motion";

export const Spinner = () => (
    <motion.div
        className="w-12 h-12 border-4 border-t-transparent border-zinc-300 rounded-full animate-spin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
    />
);

const FullPageLoader = () => (
    <motion.div
        key="loader"
        className="h-screen w-screen flex flex-col justify-center items-center bg-black fixed top-0 left-0 z-[100]"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
    >
        <Spinner />
    </motion.div>
);

export default FullPageLoader;