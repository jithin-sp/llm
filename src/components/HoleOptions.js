"use client";

import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Shuffle } from 'lucide-react';

const HoleOptions = ({ onSelect, position, isUltimate = false }) => {
    // position: { top, left }

    const variants = {
        hidden: { opacity: 0, scale: 0.8, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    // Ultimate Quiz only has shuffle mode
    if (isUltimate) {
        return (
            <motion.div
                className="absolute z-30 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-xl border border-purple-600 p-3 w-40"
                style={{
                    top: position.top,
                    left: position.left,
                    transform: 'translate(-50%, 10px)'
                }}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={variants}
            >
                <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-500 border-t border-l border-purple-600 rotate-45"></div>
                <button
                    onClick={() => onSelect('shuffle')}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-white text-purple-600 rounded-lg text-sm font-bold transition-all hover:scale-105"
                >
                    <span className="text-lg">🏆</span>
                    Start Ultimate Quiz
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="absolute z-30 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-2 w-32"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, 10px)' // Move down by 10px
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
        >
            {/* Upward Arrow */}
            <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

            <button
                onClick={() => onSelect('learn')}
                className="flex items-center gap-2 p-2 hover:bg-blue-50 text-blue-600 rounded-lg text-sm font-medium transition-colors"
            >
                <BookOpen size={16} />
                Learn
            </button>
            <button
                onClick={() => onSelect('practice')}
                className="flex items-center gap-2 p-2 hover:bg-green-50 text-green-600 rounded-lg text-sm font-medium transition-colors"
            >
                <CheckCircle size={16} />
                Practice
            </button>
            <button
                onClick={() => onSelect('shuffle')}
                className="flex items-center gap-2 p-2 hover:bg-purple-50 text-purple-600 rounded-lg text-sm font-medium transition-colors"
            >
                <Shuffle size={16} />
                Shuffle
            </button>
        </motion.div>
    );
};

export default HoleOptions;
