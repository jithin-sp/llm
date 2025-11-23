"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowLeft, Loader2, Carrot } from 'lucide-react';
import { databases, APPWRITE_CONFIG } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { useGame } from '../../context/GameContext';

export default function Leaderboard() {
    const router = useRouter();
    const { user } = useGame();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState(null);
    const [userStats, setUserStats] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
        if (user) {
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            // Fetch current user's profile
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.usersCollectionId,
                [
                    Query.equal('userId', user.$id),
                    Query.limit(1)
                ]
            );

            if (response.documents.length > 0) {
                setUserStats(response.documents[0]);
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            
            // Fetch all users sorted by total score (quiz performance)
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.usersCollectionId,
                [
                    Query.orderDesc('totalScore'),
                    Query.limit(100)
                ]
            );

            const users = response.documents.map((doc, index) => ({
                rank: index + 1,
                username: doc.username || 'Anonymous',
                totalScore: doc.totalScore || 0,
                averageScore: doc.averageScore || 0,
                totalQuizzesTaken: doc.totalQuizzesTaken || 0,
                totalCorrect: doc.totalCorrect || 0,
                totalQuestionsAnswered: doc.totalQuestionsAnswered || 0,
                userId: doc.userId,
            }));

            setLeaderboardData(users);

            // Find current user's rank
            if (user) {
                const currentUserRank = users.findIndex(u => u.userId === user.$id);
                if (currentUserRank !== -1) {
                    setUserRank(currentUserRank + 1);
                }
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-orange-600 fill-orange-600" />;
        return <span className="text-gray-500 font-bold">{rank}</span>;
    };

    const getRankBg = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
        if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
        return 'bg-white border-gray-200';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/home')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Leaderboard
                    </h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* User Stats Card */}
                {user && userStats && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-6 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm opacity-90">Your Rank</p>
                                <p className="text-4xl font-bold">
                                    {userRank ? `#${userRank}` : '—'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90">Total Score</p>
                                <p className="text-3xl font-bold">{userStats.totalScore || 0}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                <p className="text-xs opacity-90">Quizzes Taken</p>
                                <p className="text-xl font-bold">{userStats.totalQuizzesTaken || 0}</p>
                            </div>
                            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                <p className="text-xs opacity-90">Avg Score</p>
                                <p className="text-xl font-bold">{(userStats.averageScore || 0).toFixed(1)}%</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Leaderboard List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboardData.map((player, index) => {
                            const isCurrentUser = user && player.userId === user.$id;
                            
                            return (
                                <motion.div
                                    key={player.userId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`${getRankBg(player.rank)} ${
                                        isCurrentUser ? 'ring-2 ring-blue-500' : ''
                                    } rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div className="w-10 flex items-center justify-center">
                                            {getRankIcon(player.rank)}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1">
                                            <p className={`font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                                                {player.username}
                                                {isCurrentUser && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {player.totalQuizzesTaken} quizzes • {(player.averageScore || 0).toFixed(1)}% avg
                                            </p>
                                        </div>

                                        {/* Total Score */}
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                <Trophy className="w-4 h-4 text-blue-500" />
                                                <span className="font-bold text-blue-600">{player.totalScore}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{player.totalCorrect}/{player.totalQuestionsAnswered}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {leaderboardData.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>No players yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
