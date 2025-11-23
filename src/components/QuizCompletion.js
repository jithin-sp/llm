"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Home, ArrowLeft } from 'lucide-react';
import { getLeaderboard, getCurrentUser } from '@/lib/appwrite';

const QuizCompletion = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userRowRef = useRef(null);

    // Quiz results from URL params
    const weekNumber = parseInt(searchParams.get('week') || '1');
    const mode = searchParams.get('mode') || 'practice';
    const score = parseInt(searchParams.get('score') || '0');
    const total = parseInt(searchParams.get('total') || '10');
    const correct = parseInt(searchParams.get('correct') || '0');
    const incorrect = parseInt(searchParams.get('incorrect') || '0');
    const scorePercentage = Math.round((score / total) * 100);

    // Leaderboard state
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboardData();
    }, []);

    const loadLeaderboardData = async () => {
        try {
            setLoading(true);

            const user = await getCurrentUser();
            if (user) {
                setCurrentUserId(user.$id);
            }

            const data = await getLeaderboard(100);
            setLeaderboard(data);

            setTimeout(() => {
                userRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMedalIcon = (rank) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
        if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
        return null;
    };

    const topThree = leaderboard.slice(0, 3);
    const restOfLeaderboard = leaderboard.slice(3);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-7xl mx-auto p-4">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.push('/home')}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to Home</span>
                    </button>
                    <div className="text-sm text-gray-500">
                        Week {weekNumber} • {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Left Side - Quiz Results (1/4) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4 sticky top-4">
                            <h2 className="text-lg font-bold text-blue-900 mb-3 text-center">Your Score</h2>

                            {/* Score Display */}
                            <div className="text-center mb-4">
                                <div className="text-5xl font-black text-blue-600 mb-1">
                                    {score}/{total}
                                </div>
                                <div className="text-xl font-semibold text-gray-700">
                                    {scorePercentage}%
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Correct</span>
                                    <span className="text-lg font-bold text-green-600">{correct}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Incorrect</span>
                                    <span className="text-lg font-bold text-red-600">{incorrect}</span>
                                </div>
                            </div>

                            {/* Performance Badge */}
                            <div className="mt-4 text-center">
                                {scorePercentage >= 80 ? (
                                    <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold">
                                        🎉 Excellent!
                                    </div>
                                ) : scorePercentage >= 60 ? (
                                    <div className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg text-sm font-semibold">
                                        👍 Good Job!
                                    </div>
                                ) : (
                                    <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold">
                                        💪 Keep Practicing!
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side - Leaderboard (3/4) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-blue-600" />
                                Leaderboard
                            </h2>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-3 text-sm">Loading rankings...</p>
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No rankings yet. Be the first!</p>
                                </div>
                            ) : (
                                <>
                                    {/* Top 3 Podium */}
                                    {topThree.length > 0 && (
                                        <div className="mb-6 pb-6 border-b border-gray-200">
                                            <div className="grid grid-cols-3 gap-3">
                                                {topThree.map((user, idx) => {
                                                    const isCurrentUser = user.userId === currentUserId;
                                                    return (
                                                        <motion.div
                                                            key={user.$id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className={`p-3 rounded-lg border-2 ${user.rank === 1 ? 'bg-yellow-50 border-yellow-400' :
                                                                    user.rank === 2 ? 'bg-gray-50 border-gray-400' :
                                                                        'bg-amber-50 border-amber-400'
                                                                } ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
                                                        >
                                                            <div className="flex items-center justify-center mb-2">
                                                                {getMedalIcon(user.rank)}
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-xs font-semibold text-gray-600 mb-1">
                                                                    #{user.rank}
                                                                </div>
                                                                <div className="font-bold text-sm text-gray-800 truncate">
                                                                    {user.username}
                                                                </div>
                                                                <div className="text-lg font-black text-blue-600">
                                                                    {user.totalScore}
                                                                </div>
                                                                <div className="text-xs text-gray-500">points</div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* All Rankings */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">All Rankings</h3>
                                        <div className="space-y-1 max-h-96 overflow-y-auto">
                                            {leaderboard.map((user, idx) => {
                                                const isCurrentUser = user.userId === currentUserId;
                                                return (
                                                    <motion.div
                                                        key={user.$id}
                                                        ref={isCurrentUser ? userRowRef : null}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.02 }}
                                                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isCurrentUser
                                                                ? 'bg-blue-100 border-2 border-blue-500'
                                                                : 'bg-gray-50 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                                                                }`}>
                                                                {user.rank}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm text-gray-800 truncate">
                                                                    {user.username}
                                                                    {isCurrentUser && <span className="ml-1 text-blue-600">(You)</span>}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {user.totalQuizzesTaken} quizzes • {user.averageScore.toFixed(0)}% avg
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-blue-600">
                                                                {user.totalScore}
                                                            </div>
                                                            <div className="text-xs text-gray-500">pts</div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default QuizCompletion;
