"use client";

import { useRef, useState, useEffect } from 'react';
import Hole from './Hole';
import Rabbit from './Rabbit';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Shuffle } from 'lucide-react';

const Roadmap = ({ onHoleClick, onQuizStart, showTooltip, tooltipWeek }) => {
    const { currentWeek, unlockedWeeks, completedWeeks } = useGame();
    const containerRef = useRef(null);
    const holeRefs = useRef({});
    const [focusedWeek, setFocusedWeek] = useState(null);

    // Clear focused week on mount (when returning to home page)
    useEffect(() => {
        setFocusedWeek(null);
    }, []);

    // Auto-scroll to bottom on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, []);

    // Auto-scroll to tooltip week when it appears
    useEffect(() => {
        if (tooltipWeek && holeRefs.current[tooltipWeek] && containerRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                const holeElement = holeRefs.current[tooltipWeek];
                const container = containerRef.current;

                if (!holeElement || !container) return;

                // Calculate scroll position to center the hole
                const holeRect = holeElement.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const scrollTop = container.scrollTop;
                const targetScroll = scrollTop + holeRect.top - containerRect.top - (containerRect.height / 2) + (holeRect.height / 2);

                container.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [tooltipWeek, showTooltip]);

    // Define positions for 12 holes + Ultimate Quiz (winding path upwards)
    const positions = [
        { x: 20, y: 90 }, // Week 1
        { x: 50, y: 85 }, // Week 2
        { x: 80, y: 80 }, // Week 3
        { x: 80, y: 70 }, // Week 4
        { x: 50, y: 65 }, // Week 5
        { x: 20, y: 60 }, // Week 6
        { x: 20, y: 50 }, // Week 7
        { x: 50, y: 45 }, // Week 8
        { x: 80, y: 40 }, // Week 9
        { x: 80, y: 30 }, // Week 10
        { x: 50, y: 25 }, // Week 11
        { x: 20, y: 20 }, // Week 12
        { x: 50, y: 10 }, // Ultimate Quiz (Week 13)
    ];

    const getStatus = (week) => {
        // Ultimate Quiz (week 13) is unlocked only if all 12 weeks are unlocked
        if (week === 13) {
            const allWeeksUnlocked = Array.from({ length: 12 }, (_, i) => i + 1).every(w => unlockedWeeks.includes(w));
            if (!allWeeksUnlocked) return 'locked';
            if (completedWeeks.includes(week)) return 'completed';
            return 'unlocked';
        }
        
        if (completedWeeks.includes(week)) return 'completed';
        if (unlockedWeeks.includes(week)) return 'unlocked';
        return 'locked';
    };

    const handleHoleInteraction = (week) => {
        const status = getStatus(week);

        if (status === 'locked') {
            onHoleClick(week); // Trigger unlock modal or tooltip
        } else {
            // Set focus to this hole (opens modal)
            setFocusedWeek(week);
        }
    };

    const handleOptionSelect = (mode) => {
        if (focusedWeek) {
            onQuizStart(focusedWeek, mode);
            setFocusedWeek(null); // Close modal
        }
    };

    // Generate smooth curved SVG path connecting the points (like hand-drawn)
    const generatePath = () => {
        if (positions.length === 0) return "";
        
        // Start at first position (using viewBox coordinates 0-100)
        let path = `M ${positions[0].x} ${positions[0].y}`;
        
        // Create smooth curves between points using cubic bezier curves for more organic feel
        for (let i = 1; i < positions.length; i++) {
            const prev = positions[i - 1];
            const curr = positions[i];
            
            // Calculate control points for smooth S-curve
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            
            // First control point (closer to previous point)
            const cp1x = prev.x + dx * 0.3;
            const cp1y = prev.y + dy * 0.2;
            
            // Second control point (closer to current point)
            const cp2x = prev.x + dx * 0.7;
            const cp2y = prev.y + dy * 0.8;
            
            // Add organic variation based on position
            const variation1 = (i % 3 === 0) ? 3 : (i % 3 === 1) ? -3 : 0;
            const variation2 = (i % 2 === 0) ? -2 : 2;
            
            // Use cubic bezier curve for smooth, organic connection
            path += ` C ${cp1x + variation1} ${cp1y + variation2}, ${cp2x - variation1} ${cp2y - variation2}, ${curr.x} ${curr.y}`;
        }
        
        return path;
    };

    return (
        <div className="relative w-full max-w-md mx-auto h-[80vh] bg-white overflow-y-auto scroll-smooth" ref={containerRef}>
            <div className="h-[1500px] relative">
                {/* Background Path - Smooth curved line */}
                <svg 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                        {/* Gradient for the path */}
                        <linearGradient id="pathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="50%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                    {/* Shadow/outline for depth */}
                    <path
                        d={generatePath()}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.5"
                        vectorEffect="non-scaling-stroke"
                    />
                    {/* Main gradient path */}
                    <path
                        d={generatePath()}
                        fill="none"
                        stroke="url(#pathGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.7"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                {/* Holes */}
                {positions.map((pos, index) => {
                    const week = index + 1;
                    const isFocused = focusedWeek === week;
                    const showWeekTooltip = showTooltip && tooltipWeek === week;
                    const isUltimate = week === 13;

                    return (
                        <div
                            key={week}
                            ref={(el) => holeRefs.current[week] = el}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        >
                            <Hole
                                weekNumber={week}
                                status={getStatus(week)}
                                onClick={() => handleHoleInteraction(week)}
                                isActive={currentWeek === week} // Visual active state (rabbit)
                                isFocused={isFocused} // Visual focus state (ring)
                                isUltimate={isUltimate}
                            />

                            {/* Tooltip for sequential unlock message */}
                            <AnimatePresence>
                                {showWeekTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                        className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
                                    >
                                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span>👆</span>
                                                <span>Unlock this week first!</span>
                                            </div>
                                            {/* Arrow pointing down */}
                                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-600"></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Rabbit Position */}
                            {currentWeek === week && (
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 pointer-events-none">
                                    <Rabbit />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mode Selection Modal */}
            <AnimatePresence>
                {focusedWeek && getStatus(focusedWeek) !== 'locked' && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center flex items-center justify-center gap-2">
                                {focusedWeek === 13 ? (
                                    <>
                                        <img src="/castel.png" alt="Castle" className="w-8 h-8 object-contain" />
                                        Ultimate Quiz
                                    </>
                                ) : `Week ${focusedWeek}`}
                            </h2>
                            <p className="text-gray-600 mb-6 text-center text-sm">
                                {focusedWeek === 13 ? 'Face all questions in one ultimate challenge!' : 'Choose your quiz mode'}
                            </p>

                            {/* Mode Options */}
                            {focusedWeek === 13 ? (
                                <button
                                    onClick={() => handleOptionSelect('shuffle')}
                                    className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-lg font-bold transition-all hover:scale-105 shadow-lg"
                                >
                                    <span className="text-2xl">🏆</span>
                                    Start Ultimate Quiz
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleOptionSelect('learn')}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 text-blue-600 rounded-xl font-medium transition-all border-2 border-blue-200 hover:border-blue-400"
                                    >
                                        <BookOpen size={20} />
                                        <div className="flex-1 text-left">
                                            <div className="font-bold">Learn Mode</div>
                                            <div className="text-xs text-gray-500">See answers as you go</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleOptionSelect('practice')}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-green-50 text-green-600 rounded-xl font-medium transition-all border-2 border-green-200 hover:border-green-400"
                                    >
                                        <CheckCircle size={20} />
                                        <div className="flex-1 text-left">
                                            <div className="font-bold">Practice Mode</div>
                                            <div className="text-xs text-gray-500">Test yourself without pressure</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleOptionSelect('shuffle')}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-purple-50 text-purple-600 rounded-xl font-medium transition-all border-2 border-purple-200 hover:border-purple-400"
                                    >
                                        <Shuffle size={20} />
                                        <div className="flex-1 text-left">
                                            <div className="font-bold">Shuffle Mode</div>
                                            <div className="text-xs text-gray-500">Random order challenge</div>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Cancel Button */}
                            <button
                                onClick={() => setFocusedWeek(null)}
                                className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Roadmap;
