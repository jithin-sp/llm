"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Roadmap from '../../components/Roadmap';
import { useGame } from '../../context/GameContext';
import { Carrot, Clock, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const router = useRouter();
    const { carrots, unlockWeek, unlockedWeeks, completedWeeks } = useGame();
    const [showUnlockModal, setShowUnlockModal] = useState(null);
    const [showUltimateModal, setShowUltimateModal] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipWeek, setTooltipWeek] = useState(null);
    const [isSpecialOffer, setIsSpecialOffer] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);

    const totalWeeks = 13; // 12 weeks + Ultimate Quiz
    const progressPercentage = Math.round((completedWeeks.length / totalWeeks) * 100);

    // Check for special 5-hour free offer
    useEffect(() => {
        const checkSpecialOffer = () => {
            try {
                const offerKey = 'ultimateQuizSpecialOffer';
                const offerData = localStorage.getItem(offerKey);
                
                if (offerData) {
                    const { startTime } = JSON.parse(offerData);
                    const elapsed = Date.now() - startTime;
                    const fiveHours = 5 * 60 * 60 * 1000;
                    
                    if (elapsed < fiveHours) {
                        setIsSpecialOffer(true);
                        setTimeRemaining(fiveHours - elapsed);
                    } else {
                        localStorage.removeItem(offerKey);
                        setIsSpecialOffer(false);
                    }
                }
            } catch (error) {
                console.warn('localStorage not available for special offer:', error);
            }
        };

        checkSpecialOffer();
        const interval = setInterval(checkSpecialOffer, 1000);
        return () => clearInterval(interval);
    }, []);

    // Format time remaining
    const formatTime = (ms) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handleHoleClick = (week) => {
        // Only called for locked holes now
        
        // Ultimate Quiz (week 13) - show unlock modal
        if (week === 13) {
            setShowUltimateModal(true);
            return;
        }
        
        const prevWeek = week - 1;

        if (week === 1 || unlockedWeeks.includes(prevWeek)) {
            // Can unlock this week - show modal
            setShowUnlockModal(week);
        } else {
            // Must unlock previous week first - find the next sequential locked week
            const nextLockedWeek = findNextLockedWeek();
            if (nextLockedWeek) {
                // Clear any existing tooltip first
                setShowTooltip(false);
                setTooltipWeek(null);
                
                // Set new tooltip and trigger scroll
                setTimeout(() => {
                    setTooltipWeek(nextLockedWeek);
                    setShowTooltip(true);
                }, 50);

                // Hide tooltip after 4 seconds
                setTimeout(() => {
                    setShowTooltip(false);
                    setTooltipWeek(null);
                }, 4050);
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
        // Ultimate Quiz always uses shuffle mode with all questions
        if (week === 13) {
            router.push(`/quiz/ultimate/shuffle`);
        } else {
            router.push(`/quiz/${week}/${mode}`);
        }
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

    const handleUltimateUnlock = () => {
        const allWeeksUnlocked = Array.from({ length: 12 }, (_, i) => i + 1).every(w => unlockedWeeks.includes(w));
        
        if (!allWeeksUnlocked) {
            return; // Should not happen, but safety check
        }

        const cost = isSpecialOffer ? 0 : 5;

        if (cost > 0 && carrots < cost) {
            return; // Not enough carrots
        }

        // Unlock Ultimate Quiz (week 13) with custom cost
        const success = unlockWeek(13, cost);
        if (success) {
            setShowUltimateModal(false);
        }
    };

    const activateSpecialOffer = () => {
        try {
            const offerKey = 'ultimateQuizSpecialOffer';
            localStorage.setItem(offerKey, JSON.stringify({ startTime: Date.now() }));
            setIsSpecialOffer(true);
            setTimeRemaining(5 * 60 * 60 * 1000);
        } catch (error) {
            console.warn('Failed to activate special offer:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
            {/* Floating Island Header */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4 w-[90%] max-w-md justify-between"
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/leaderboard')}
                        className="p-2 bg-yellow-50 hover:bg-yellow-100 rounded-xl border border-yellow-200 transition-colors"
                        title="Leaderboard"
                    >
                        <Trophy className="w-5 h-5 text-yellow-600" />
                    </button>
                    
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                        <Carrot className="w-5 h-5 text-orange-500 fill-orange-500" />
                        <span className="font-bold text-orange-600">{carrots}</span>
                    </div>
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

            {/* Regular Week Unlock Modal */}
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

            {/* Ultimate Quiz Unlock Modal */}
            <AnimatePresence>
                {showUltimateModal && (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-purple-400 relative overflow-hidden"
                        >
                            {/* Decorative shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                                animate={{
                                    x: ['-100%', '100%'],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                }}
                            />

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Castle Icon */}
                                <div className="text-center mb-4">
                                    <img 
                                        src="/castel.png" 
                                        alt="Castle" 
                                        className="w-24 h-24 mx-auto object-contain"
                                    />
                                </div>

                                <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Ultimate Quiz</h2>
                                
                                {/* Check if all weeks are unlocked */}
                                {!Array.from({ length: 12 }, (_, i) => i + 1).every(w => unlockedWeeks.includes(w)) ? (
                                    <>
                                        <p className="text-gray-700 text-center mb-6 text-lg">
                                            🔒 Unlock all 12 weeks first!
                                        </p>
                                        <button
                                            onClick={() => setShowUltimateModal(false)}
                                            className="w-full py-4 bg-gray-600 text-white rounded-xl font-bold text-lg hover:bg-gray-700 transition-colors"
                                        >
                                            Got it
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Special Offer Banner */}
                                        {isSpecialOffer ? (
                                            <motion.div
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl mb-4 text-center"
                                            >
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <Sparkles className="w-5 h-5" />
                                                    <span className="font-bold text-lg">SPECIAL OFFER!</span>
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <div className="flex items-center justify-center gap-2 text-sm">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatTime(timeRemaining)} remaining</span>
                                                </div>
                                            </motion.div>
                                        ) : null}

                                        <p className="text-gray-700 text-center mb-4">
                                            Face all questions from all 12 weeks in one ultimate challenge!
                                        </p>

                                        {/* Cost Display */}
                                        <div className="bg-white/80 rounded-xl p-4 mb-6 text-center border-2 border-purple-300">
                                            {isSpecialOffer ? (
                                                <>
                                                    <div className="text-gray-400 line-through text-lg mb-1">5 🥕</div>
                                                    <div className="text-3xl font-bold text-green-600">FREE!</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-sm text-gray-600 mb-1">Unlock Cost</div>
                                                    <div className="text-3xl font-bold text-orange-600">5 🥕</div>
                                                </>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            {!isSpecialOffer && (
                                                <button
                                                    onClick={activateSpecialOffer}
                                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <Sparkles className="w-5 h-5" />
                                                    Activate 5-Hour Free Pass
                                                </button>
                                            )}

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowUltimateModal(false)}
                                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUltimateUnlock}
                                                    disabled={!isSpecialOffer && carrots < 5}
                                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                                >
                                                    {isSpecialOffer ? 'Unlock FREE' : 'Unlock'}
                                                </button>
                                            </div>
                                        </div>

                                        {!isSpecialOffer && carrots < 5 && (
                                            <p className="text-red-500 text-sm text-center mt-3">
                                                Not enough carrots! You need {5 - carrots} more.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
