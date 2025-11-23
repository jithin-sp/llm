"use client";

import { motion } from 'framer-motion';

const Rabbit = () => {
    return (
        <motion.div
            className="w-12 h-12 absolute z-20 pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -10, 0] }}
            transition={{
                scale: { duration: 0.5 },
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
        >
            {/* Simple SVG Rabbit */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <g fill="none" stroke="none">
                    {/* Body */}
                    <circle cx="50" cy="60" r="25" fill="#ffffff" />
                    {/* Head */}
                    <circle cx="50" cy="35" r="20" fill="#ffffff" />
                    {/* Ears */}
                    <ellipse cx="35" cy="15" rx="5" ry="15" fill="#ffffff" />
                    <ellipse cx="65" cy="15" rx="5" ry="15" fill="#ffffff" />
                    {/* Inner Ears */}
                    <ellipse cx="35" cy="15" rx="3" ry="10" fill="#ffb7b2" />
                    <ellipse cx="65" cy="15" rx="3" ry="10" fill="#ffb7b2" />
                    {/* Eyes */}
                    <circle cx="43" cy="32" r="2" fill="#000000" />
                    <circle cx="57" cy="32" r="2" fill="#000000" />
                    {/* Nose */}
                    <circle cx="50" cy="38" r="2" fill="#ffb7b2" />
                </g>
            </svg>
        </motion.div>
    );
};

export default Rabbit;
