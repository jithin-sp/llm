"use client";

import { useRef, useState, useEffect } from 'react';
import Hole from './Hole';
import Rabbit from './Rabbit';
import HoleOptions from './HoleOptions';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const Roadmap = ({ onHoleClick, onQuizStart, showTooltip, tooltipWeek }) => {
    const { currentWeek, unlockedWeeks, completedWeeks } = useGame();
    const containerRef = useRef(null);
    const holeRefs = useRef({});
    const [focusedWeek, setFocusedWeek] = useState(null);

    // Set initial focus to current week
    useEffect(() => {
        if (currentWeek) {
            setFocusedWeek(currentWeek);
        }
    }, [currentWeek]);

    // Auto-scroll to bottom on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, []);

    // Auto-scroll to tooltip week when it appears
    useEffect(() => {
        if (tooltipWeek && holeRefs.current[tooltipWeek] && containerRef.current) {
            const holeElement = holeRefs.current[tooltipWeek];
            const container = containerRef.current;

            // Calculate scroll position to center the hole
            const holeRect = holeElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const scrollTop = container.scrollTop;
            const targetScroll = scrollTop + holeRect.top - containerRect.top - (containerRect.height / 2) + (holeRect.height / 2);

            container.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    }, [tooltipWeek]);

    // Define positions for 12 holes (winding path upwards)
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
    ];

    const getStatus = (week) => {
        if (completedWeeks.includes(week)) return 'completed';
        if (unlockedWeeks.includes(week)) return 'unlocked';
        return 'locked';
    };

    const handleHoleInteraction = (week) => {
        const status = getStatus(week);

        if (status === 'locked') {
            onHoleClick(week); // Trigger unlock modal or tooltip
        } else {
            // Set focus to this hole
            setFocusedWeek(week);
        }
    };

    const handleOptionSelect = (mode) => {
        if (focusedWeek) {
            onQuizStart(focusedWeek, mode);
        }
    };

    // Generate SVG path string connecting the points
    const generatePath = () => {
        if (positions.length === 0) return "";
        let path = `M ${positions[0].x} ${positions[0].y}`;
        for (let i = 1; i < positions.length; i++) {
            path += ` L ${positions[i].x} ${positions[i].y}`;
        }
        return path;
    };

    return (
        <div className="relative w-full max-w-md mx-auto h-[80vh] bg-white overflow-y-auto scroll-smooth" ref={containerRef}>
            <div className="h-[1500px] relative">
                {/* Background Path */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                    <path
                        d={generatePath().replace(/[ML]/g, (c) => c === 'M' ? 'M ' : ' L ').replace(/(\d+) (\d+)/g, (match, x, y) => `${x}% ${y}%`)}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="10 10"
                    />
                </svg>

                {/* Holes */}
                {positions.map((pos, index) => {
                    const week = index + 1;
                    const isFocused = focusedWeek === week;
                    const showWeekTooltip = showTooltip && tooltipWeek === week;

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
                            />

                            {/* Options Popover - Show if focused and unlocked/completed */}
                            {isFocused && getStatus(week) !== 'locked' && (
                                <HoleOptions
                                    position={{ top: '100%', left: '50%' }}
                                    onSelect={handleOptionSelect}
                                />
                            )}

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
        </div>
    );
};

export default Roadmap;
