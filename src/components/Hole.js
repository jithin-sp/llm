"use client";

import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';

const Hole = ({ weekNumber, status, onClick, isActive, isFocused }) => {
    // status: 'locked', 'unlocked', 'completed'

    const baseClasses = "w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-md transition-all duration-300 cursor-pointer relative";

    const statusClasses = {
        locked: "bg-gray-200 border-gray-300 text-gray-400",
        unlocked: "bg-white border-blue-500 text-blue-600 hover:scale-110 hover:shadow-lg hover:shadow-blue-200",
        completed: "bg-green-100 border-green-500 text-green-600 hover:scale-110",
    };

    const activeClasses = isActive ? "scale-110 z-10" : "";
    const focusClasses = isFocused ? "ring-4 ring-blue-300 ring-offset-2 scale-110 z-10" : "";

    return (
        <motion.div
            className={`${baseClasses} ${statusClasses[status]} ${activeClasses} ${focusClasses}`}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
        >
            <span className="text-xl font-bold font-mono">
                {status === 'locked' ? <Lock size={20} /> : status === 'completed' ? <Check size={24} /> : weekNumber}
            </span>

            {/* Label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-500 whitespace-nowrap">
                Week {weekNumber}
            </div>
        </motion.div>
    );
};

export default Hole;
