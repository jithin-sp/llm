"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Roadmap from '../../components/Roadmap';
import { useGame } from '../../context/GameContext';
import { Carrot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const router = useRouter();
    const { carrots, unlockWeek, unlockedWeeks, completedWeeks } = useGame();
    const [showUnlockModal, setShowUnlockModal] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipWeek, setTooltipWeek] = useState(null);

    const totalWeeks = 12;
    const progressPercentage = Math.round((completedWeeks.length / totalWeeks) * 100);

    const handleHoleClick = (week) => {
        // Only called for locked holes now
        const prevWeek = week - 1;

        if (week === 1 || unlockedWeeks.includes(prevWeek)) {
            // Can unlock this week - show modal
            setShowUnlockModal(week);
        } else {
            // Must unlock previous week first - scroll to it and show tooltip
            const nextLockedWeek = findNextLockedWeek();
            if (nextLockedWeek) {
                setTooltipWeek(nextLockedWeek);
                setShowTooltip(true);

                // Hide tooltip after 3 seconds
                setTimeout(() => {
                    setShowTooltip(false);
                }, 3000);
            }
        }
    };

    // Find the next week that needs to be unlocked (sequential order)
    const findNextLockedWeek = () => {
        for (let week = 1; week <= 12; week++) {
            if (!unlockedWeeks.includes(week)) {
                return week;
            }
        }
        return null;
    };

    const handleQuizStart = (week, mode) => {
        router.push(`/quiz/${week}/${mode}`);
    };

    const handleUnlock = () => {
        if (showUnlockModal) {
            const success = unlockWeek(showUnlockModal);
            if (success) {
                setShowUnlockModal(null);
            } else {
                alert("Not enough carrots!");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            {/* Floating Island Header */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-6 w-[90%] max-w-md justify-between"
            >
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Journey</span>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                    <Carrot className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <span className="font-bold text-orange-600">{carrots}</span>
                </div>
            </motion.div>

            <div className="pt-24 pb-0 h-screen">
                <Roadmap
                    onHoleClick={handleHoleClick}
                    onQuizStart={handleQuizStart}
                    showTooltip={showTooltip}
                    tooltipWeek={tooltipWeek}
                />
            </div>

            {/* Unlock Modal */}
            {showUnlockModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Unlock Week {showUnlockModal}?</h2>
                        <p className="text-gray-600 mb-6">
                            This will cost <span className="font-bold text-orange-600">1 🥕</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUnlockModal(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnlock}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                Unlock
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
