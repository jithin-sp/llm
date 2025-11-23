import { Client, Account, Databases, Query, ID } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'dummy-project-id'); // Fallback for build

export const account = new Account(client);
export const databases = new Databases(client);

export const APPWRITE_CONFIG = {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
    usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '',
    quizAttemptsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID || '',
};

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

/**
 * Create or get user profile
 * @param {string} userId - Appwrite user ID
 * @param {string} username - Display name
 * @param {string} email - User email (optional)
 * @returns {Promise<Object>} User profile document
 */
export async function createOrGetUserProfile(userId, username, email = '') {
    try {
        // Try to get existing user profile
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            [Query.equal('userId', userId)]
        );

        if (response.documents.length > 0) {
            return response.documents[0];
        }

        // Create new user profile with game state
        try {
            const newUser = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.usersCollectionId,
                ID.unique(),
                {
                    userId,
                    username,
                    email,
                    totalQuizzesTaken: 0,
                    totalQuestionsAnswered: 0,
                    totalCorrect: 0,
                    totalIncorrect: 0,
                    totalScore: 0,
                    averageScore: 0.0,
                    rank: null,
                    // Game state fields
                    carrots: 12,
                    unlockedWeeks: [1],
                }
            );
            return newUser;
        } catch (createError) {
            // If document already exists (race condition), fetch it again
            if (createError.code === 409 || createError.message?.includes('already exists')) {
                const retryResponse = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.usersCollectionId,
                    [Query.equal('userId', userId)]
                );

                if (retryResponse.documents.length > 0) {
                    return retryResponse.documents[0];
                }
            }
            throw createError;
        }
    } catch (error) {
        console.error('Error creating/getting user profile:', error);
        throw error;
    }
}

// ============================================
// QUIZ ATTEMPT FUNCTIONS
// ============================================

/**
 * Save quiz attempt and update user stats atomically
 * This function combines both operations to prevent race conditions
 * @param {Object} attemptData - Quiz attempt data
 * @returns {Promise<Object>} Object containing attempt and updated user profile
 */
export async function saveQuizResultsAndUpdateUser(attemptData) {
    try {
        const {
            userId,
            username,
            email = '',
            weekNumber,
            mode,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            score,
            scorePercentage,
            timeTaken = null,
        } = attemptData;

        // Validate weekNumber is a valid integer
        if (weekNumber === undefined || weekNumber === null || isNaN(weekNumber)) {
            throw new Error(`Invalid weekNumber: ${weekNumber}. Must be a valid integer.`);
        }

        // Ensure weekNumber is an integer
        const validWeekNumber = parseInt(weekNumber, 10);
        if (isNaN(validWeekNumber)) {
            throw new Error(`weekNumber could not be converted to integer: ${weekNumber}`);
        }

        console.log('Saving quiz attempt with weekNumber:', validWeekNumber);

        // Step 1: Get or create user profile (only once)
        const userProfile = await createOrGetUserProfile(userId, username, email);

        // Step 2: Save quiz attempt
        const attempt = await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.quizAttemptsCollectionId,
            ID.unique(),
            {
                userId,
                username,
                weekNumber: validWeekNumber,
                mode,
                totalQuestions,
                correctAnswers,
                incorrectAnswers,
                score,
                scorePercentage,
                timeTaken,
                completedAt: new Date().toISOString(),
            }
        );

        // Step 3: Update user statistics
        const newTotalQuizzes = userProfile.totalQuizzesTaken + 1;
        const newTotalQuestions = userProfile.totalQuestionsAnswered + totalQuestions;
        const newTotalCorrect = userProfile.totalCorrect + correctAnswers;
        const newTotalIncorrect = userProfile.totalIncorrect + incorrectAnswers;
        const newTotalScore = userProfile.totalScore + score;
        const newAverageScore = (newTotalCorrect / newTotalQuestions) * 100;

        const updatedUser = await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            userProfile.$id,
            {
                totalQuizzesTaken: newTotalQuizzes,
                totalQuestionsAnswered: newTotalQuestions,
                totalCorrect: newTotalCorrect,
                totalIncorrect: newTotalIncorrect,
                totalScore: newTotalScore,
                averageScore: newAverageScore,
            }
        );

        return {
            attempt,
            userProfile: updatedUser,
        };
    } catch (error) {
        console.error('Error saving quiz results:', error);
        throw error;
    }
}

/**
 * Get user's quiz history
 * @param {string} userId - Appwrite user ID
 * @param {number} limit - Number of attempts to fetch
 * @returns {Promise<Array>} Array of quiz attempts
 */
export async function getUserQuizHistory(userId, limit = 10) {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.quizAttemptsCollectionId,
            [
                Query.equal('userId', userId),
                Query.orderDesc('completedAt'),
                Query.limit(limit),
            ]
        );

        return response.documents;
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        throw error;
    }
}

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

/**
 * Get leaderboard data (all users sorted by total score)
 * @param {number} limit - Number of users to fetch (default: 100)
 * @returns {Promise<Array>} Array of user profiles with rankings
 */
export async function getLeaderboard(limit = 100) {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            [
                Query.orderDesc('totalScore'),
                Query.limit(limit),
            ]
        );

        // Add rank to each user
        const leaderboard = response.documents.map((user, index) => ({
            ...user,
            rank: index + 1,
        }));

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
}

/**
 * Get user's rank in the leaderboard
 * @param {string} userId - Appwrite user ID
 * @returns {Promise<Object>} User profile with rank
 */
export async function getUserRank(userId) {
    try {
        // Get user profile
        const userProfile = await createOrGetUserProfile(userId, '');

        // Get all users with higher scores
        const higherScores = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.usersCollectionId,
            [
                Query.greaterThan('totalScore', userProfile.totalScore),
            ]
        );

        const rank = higherScores.total + 1;

        return {
            ...userProfile,
            rank,
        };
    } catch (error) {
        console.error('Error getting user rank:', error);
        throw error;
    }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user account
 */
export async function getCurrentUser() {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
