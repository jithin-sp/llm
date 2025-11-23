"use client";

import { useState, useEffect, useRef } from 'react';
import { getQuestionsForWeek } from '../lib/data';
import { useGame } from '../context/GameContext';
import { X, Loader2, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { getCurrentUser, saveQuizResultsAndUpdateUser } from '../lib/appwrite';
import { useRouter } from 'next/navigation';

const QuizInterface = ({ weekNumber, onClose, initialMode }) => {
    const router = useRouter();
    const [mode] = useState(initialMode);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const { completeWeek } = useGame();
    const solutionRef = useRef(null);

    // Quiz performance tracking
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [quizStartTime] = useState(Date.now());
    const [savingResults, setSavingResults] = useState(false);

    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true);
            try {
                let q;
                // Check if this is the Ultimate Quiz
                if (weekNumber === 'ultimate' || weekNumber === 13) {
                    // Import getAllQuestions for Ultimate Quiz
                    const { getAllQuestions } = await import('../lib/data');
                    q = await getAllQuestions();
                } else {
                    q = await getQuestionsForWeek(weekNumber);
                }
                
                let finalQuestions = [...q];
                
                // For Ultimate Quiz or shuffle mode, shuffle questions
                if (weekNumber === 'ultimate' || weekNumber === 13 || initialMode === 'shuffle') {
                    finalQuestions = finalQuestions.sort(() => Math.random() - 0.5);
                    
                    // Also shuffle options for each question
                    finalQuestions = finalQuestions.map(question => {
                        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
                        return {
                            ...question,
                            options: shuffledOptions
                        };
                    });
                }
                
                setQuestions(finalQuestions);
            } catch (error) {
                console.error("Failed to load questions", error);
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, [weekNumber, initialMode]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;

    const correctAnswers = currentQuestion.answer.toLowerCase().split(',').map(s => s.trim());
    const isMultipleChoice = correctAnswers.length > 1;

    const handleOptionToggle = (option) => {
        if (mode === 'learn' || isConfirmed) return;
        const optLetter = option.charAt(0).toLowerCase();
        if (isMultipleChoice) {
            setSelectedOptions(prev =>
                prev.includes(optLetter) ? prev.filter(o => o !== optLetter) : [...prev, optLetter]
            );
        } else {
            setSelectedOptions([optLetter]);
        }
    };

    const handleConfirm = () => {
        setIsConfirmed(true);
        setShowSolution(true);

        // Track if answer is correct
        const correct = isAnswerCorrect();
        if (correct) {
            setCorrectCount(prev => prev + 1);
        } else {
            setIncorrectCount(prev => prev + 1);
        }

        // Auto-scroll to solution if it exists (for practice and shuffle modes)
        if (currentQuestion.solution && (mode === 'practice' || mode === 'shuffle')) {
            setTimeout(() => {
                solutionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    };

    const isAnswerCorrect = () => {
        if (selectedOptions.length !== correctAnswers.length) return false;
        return selectedOptions.every(opt => correctAnswers.includes(opt)) &&
            correctAnswers.every(ans => selectedOptions.includes(ans));
    };

    const isOptionCorrect = (option) => {
        const optLetter = option.charAt(0).toLowerCase();
        return correctAnswers.includes(optLetter);
    };

    const nextQuestion = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOptions([]);
            setIsConfirmed(false);
            setShowSolution(false);
        } else {
            // Quiz completed - save results to Appwrite and navigate to completion page
            if (mode === 'practice' || mode === 'shuffle') {
                await saveQuizResults();
                // Convert weekNumber to integer for completeWeek
                const weekNum = weekNumber === 'ultimate' || weekNumber === 13 ? 13 : parseInt(weekNumber, 10);
                completeWeek(weekNum);
            } else {
                // Learn mode - just close
                onClose();
            }
        }
    };

    const saveQuizResults = async () => {
        try {
            setSavingResults(true);

            // Get current user
            const user = await getCurrentUser();
            if (!user) {
                console.error('No authenticated user found');
                return;
            }

            const totalQuestions = questions.length;
            const score = correctCount;
            const scorePercentage = (correctCount / totalQuestions) * 100;
            const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000); // in seconds

            // Convert weekNumber to integer
            let weekNum;
            if (weekNumber === 'ultimate' || weekNumber === 13) {
                weekNum = 13;
            } else {
                weekNum = parseInt(weekNumber, 10);
                if (isNaN(weekNum)) {
                    console.error('Invalid weekNumber:', weekNumber);
                    throw new Error(`Invalid weekNumber: ${weekNumber}`);
                }
            }

            console.log('Saving quiz results for week:', weekNum, 'mode:', mode);
            
            const quizResults = {
                userId: user.$id,
                username: user.name || user.email.split('@')[0],
                weekNumber: weekNum,
                mode,
                totalQuestions,
                correctAnswers: correctCount,
                incorrectAnswers: incorrectCount,
                score,
                scorePercentage,
                timeTaken,
            };

            console.log('Quiz results object:', quizResults);

            // Save quiz attempt AND update user statistics atomically (single write operation)
            await saveQuizResultsAndUpdateUser(quizResults);

            // Navigate to completion page with results
            const params = new URLSearchParams({
                week: weekNum.toString(),
                mode,
                score: score.toString(),
                total: totalQuestions.toString(),
                correct: correctCount.toString(),
                incorrect: incorrectCount.toString(),
            });

            router.push(`/quiz/completion?${params.toString()}`);
        } catch (error) {
            console.error('Error saving quiz results:', error);
            // Still allow user to close even if save fails
        } finally {
            setSavingResults(false);
        }
    };

    const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>

            <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-blue-600">Q{currentIndex + 1}/{questions.length}</span>
                    {(weekNumber === 'ultimate' || weekNumber === 13) ? (
                        <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                            🏆 Ultimate
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400 uppercase tracking-wider">{mode}</span>
                    )}
                    {isMultipleChoice && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-bold">
                            Multiple Choice
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
                <h3 className="text-xl font-medium text-gray-800 mb-6 leading-relaxed">
                    <Latex>{currentQuestion.question || ''}</Latex>
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                        const optLetter = option.charAt(0).toLowerCase();
                        const isSelected = selectedOptions.includes(optLetter);
                        const isCorrectOption = isOptionCorrect(option);
                        let stateClass = "border-gray-200 hover:border-blue-300 hover:bg-blue-50";

                        if (mode === 'learn') {
                            if (isCorrectOption) stateClass = "border-green-500 bg-green-50 text-green-700 font-medium";
                        } else if (isConfirmed) {
                            if (isSelected && isCorrectOption) {
                                stateClass = "border-green-500 bg-green-50";
                            } else if (isSelected && !isCorrectOption) {
                                stateClass = "border-red-500 bg-red-50";
                            } else if (!isSelected && isCorrectOption) {
                                stateClass = "border-green-500 bg-green-50";
                            }
                        } else if (isSelected) {
                            stateClass = "border-blue-500 bg-blue-50";
                        }

                        return (
                            <motion.div
                                key={idx}
                                onClick={() => handleOptionToggle(option)}
                                className={`w-full p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer ${stateClass} ${mode === 'learn' || isConfirmed ? 'cursor-default' : ''}`}
                                whileTap={mode === 'learn' || isConfirmed ? {} : { scale: 0.98 }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {isMultipleChoice ? (
                                            <div className={`w-5 h-5 border-2 rounded ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`w-5 h-5 border-2 rounded-full ${isSelected ? 'border-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                                                {isSelected && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Latex>{option || ''}</Latex>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {(showSolution || mode === 'learn') && currentQuestion.solution && (
                    <motion.div
                        ref={solutionRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100"
                    >
                        <div className="flex items-start gap-3">
                            <HelpCircle className="text-blue-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-blue-900 mb-1">Solution</h4>
                                <div className="text-blue-800 text-sm leading-relaxed">
                                    <Latex>{currentQuestion.solution || ''}</Latex>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-4 border-t bg-white space-y-3">
                {!isConfirmed && mode !== 'learn' ? (
                    <button
                        onClick={handleConfirm}
                        disabled={selectedOptions.length === 0}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Answer
                    </button>
                ) : (
                    <>
                        {isConfirmed && (
                            <div className={`text-center py-2 px-4 rounded-xl font-bold ${isAnswerCorrect() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isAnswerCorrect() ? '✓ Correct!' : '✗ Incorrect'}
                            </div>
                        )}
                        <button
                            onClick={nextQuestion}
                            disabled={savingResults}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {savingResults ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving Results...
                                </>
                            ) : (
                                currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuizInterface;
