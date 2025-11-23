"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, createOrGetUserProfile, databases, APPWRITE_CONFIG } from '../lib/appwrite';

const GameContext = createContext();

// Helper to check if localStorage is available
const isLocalStorageAvailable = () => {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

export const GameProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [carrots, setCarrots] = useState(12);
    const [unlockedWeeks, setUnlockedWeeks] = useState([1]);
    const [completedWeeks, setCompletedWeeks] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [userProfileId, setUserProfileId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user and game state on mount
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                // Get current authenticated user
                const currentUser = await getCurrentUser();

                if (currentUser) {
                    setUser(currentUser);

                    // Get or create user profile with game state
                    const username = currentUser.name || currentUser.email.split('@')[0];
                    const userProfile = await createOrGetUserProfile(
                        currentUser.$id,
                        username,
                        currentUser.email
                    );

                    console.log('Loaded user profile:', userProfile);

                    setUserProfileId(userProfile.$id);

                    // Load game state from user profile - check if attributes exist
                    if (userProfile.carrots !== undefined) {
                        setCarrots(userProfile.carrots);
                        console.log('Loaded carrots:', userProfile.carrots);
                    } else {
                        console.warn('carrots attribute missing in Appwrite - using default');
                    }

                    if (userProfile.unlockedWeeks !== undefined) {
                        setUnlockedWeeks(userProfile.unlockedWeeks);
                        console.log('Loaded unlockedWeeks:', userProfile.unlockedWeeks);
                    } else {
                        console.warn('unlockedWeeks attribute missing in Appwrite - using default');
                    }

                    // Calculate current week based on unlocked weeks
                    const weeks = userProfile.unlockedWeeks || [1];
                    const maxUnlocked = Math.max(...weeks);
                    setCurrentWeek(maxUnlocked);
                } else {
                    console.log('No user logged in - loading from localStorage');
                    // No user logged in - use localStorage
                    loadFromLocal();
                }
            } catch (error) {
                console.error('Error initializing game state:', error);
                loadFromLocal();
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const loadFromLocal = () => {
        if (!isLocalStorageAvailable()) {
            console.warn('localStorage is not available - using default values');
            return;
        }

        try {
            const savedState = localStorage.getItem('rabbitQuizState');
            if (savedState) {
                const { carrots, unlockedWeeks, currentWeek } = JSON.parse(savedState);
                setCarrots(carrots || 12);
                setUnlockedWeeks(unlockedWeeks || [1]);
                setCurrentWeek(currentWeek || 1);
            }
        } catch (error) {
            console.warn('Error loading from localStorage:', error);
        }
    };

    // Sync game state to database or localStorage
    useEffect(() => {
        const saveData = async () => {
            if (user && userProfileId && APPWRITE_CONFIG.usersCollectionId) {
                try {
                    console.log('Saving game state to Appwrite:', { carrots, unlockedWeeks });
                    // Save to Appwrite users collection
                    await databases.updateDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.usersCollectionId,
                        userProfileId,
                        {
                            carrots,
                            unlockedWeeks,
                        }
                    );
                    console.log('Game state saved successfully');
                } catch (error) {
                    console.error('Failed to sync game state to database:', error);
                    // Fallback to localStorage
                    saveToLocal();
                }
            } else {
                // Not logged in - save to localStorage
                saveToLocal();
            }
        };

        const saveToLocal = () => {
            if (!isLocalStorageAvailable()) {
                return; // Silently skip if not available
            }

            try {
                const state = { carrots, unlockedWeeks, currentWeek };
                localStorage.setItem('rabbitQuizState', JSON.stringify(state));
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        };

        // Debounce save to avoid too many writes
        if (!loading) {
            const timeout = setTimeout(saveData, 500);
            return () => clearTimeout(timeout);
        }
    }, [carrots, unlockedWeeks, currentWeek, user, userProfileId, loading]);

    const unlockWeek = (weekNumber) => {
        if (unlockedWeeks.includes(weekNumber)) {
            return true; // Already unlocked
        }

        if (carrots >= 1) {
            setCarrots((prev) => prev - 1);
            setUnlockedWeeks((prev) => [...prev, weekNumber]);
            setCurrentWeek(weekNumber);
            return true;
        }
        return false; // Not enough carrots
    };

    const completeWeek = (weekNumber) => {
        if (!completedWeeks.includes(weekNumber)) {
            setCompletedWeeks((prev) => [...prev, weekNumber]);

            // Move rabbit to next week (visual position)
            if (weekNumber < 12) {
                setCurrentWeek(weekNumber + 1);
            }
        }
    };

    const addCarrots = (amount) => {
        setCarrots((prev) => prev + amount);
    };

    return (
        <GameContext.Provider value={{
            user,
            carrots,
            unlockedWeeks,
            completedWeeks,
            currentWeek,
            loading,
            setCurrentWeek,
            unlockWeek,
            completeWeek,
            addCarrots,
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
