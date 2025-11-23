# Collection Structure Summary

## Overview

The quiz application uses **two separate Appwrite collections** to track user progress and quiz attempts:

1. **`users` Collection** - Stores user profiles and cumulative statistics
2. **`quizAttempts` Collection** - Stores individual quiz attempt records

---

## Collection 1: Users Profile (`users`)

### Purpose
Stores user profile information and cumulative quiz statistics for leaderboard rankings.

### Schema

```javascript
{
  userId: string,              // Appwrite user ID (unique)
  username: string,            // Display name
  email: string,               // User email (optional)
  totalQuizzesTaken: integer,  // Total number of quizzes completed
  totalQuestionsAnswered: integer, // Total questions attempted
  totalCorrect: integer,       // Total correct answers across all quizzes
  totalIncorrect: integer,     // Total incorrect answers across all quizzes
  totalScore: integer,         // Cumulative score (sum of all quiz scores)
  averageScore: double,        // Average score percentage
  rank: integer                // Current leaderboard rank (nullable)
}
```

### Indexes
- `userId` (unique) - Fast user lookup
- `totalScore` (descending) - Leaderboard sorting
- `averageScore` (descending) - Alternative ranking metric

### Use Cases
- Display user profile statistics
- Generate leaderboard rankings
- Track overall learning progress
- Calculate performance metrics

---

## Collection 2: Quiz Attempts (`quizAttempts`)

### Purpose
Stores detailed records of each individual quiz attempt for history tracking and analytics.

### Schema

```javascript
{
  userId: string,              // Reference to user
  username: string,            // Cached username for display
  weekNumber: integer,         // Week number (1-12)
  mode: string,                // Quiz mode: "practice", "shuffle", "learn"
  totalQuestions: integer,     // Number of questions in quiz
  correctAnswers: integer,     // Number correct in this attempt
  incorrectAnswers: integer,   // Number incorrect in this attempt
  score: integer,              // Score for this quiz (e.g., 8/10)
  scorePercentage: double,     // Percentage score (80.0)
  timeTaken: integer,          // Time in seconds (nullable)
  completedAt: datetime        // Completion timestamp
}
```

### Indexes
- `userId` - User's quiz history
- `weekNumber` - Week-specific queries
- `completedAt` (descending) - Recent attempts first
- `userId` + `weekNumber` (compound) - Check week completion

### Use Cases
- Display user's quiz history
- Track progress per week
- Analyze performance trends
- Show recent attempts
- Calculate time-based metrics

---

## Data Flow

### When User Completes a Quiz:

1. **Calculate Results**
   - Count correct/incorrect answers
   - Calculate score and percentage
   - Track time taken

2. **Save Quiz Attempt** (`quizAttempts` collection)
   ```javascript
   saveQuizAttempt({
     userId, username, weekNumber, mode,
     totalQuestions, correctAnswers, incorrectAnswers,
     score, scorePercentage, timeTaken
   })
   ```

3. **Update User Stats** (`users` collection)
   ```javascript
   updateUserStats(userId, quizResults)
   // Updates: totalQuizzesTaken, totalQuestionsAnswered,
   //          totalCorrect, totalIncorrect, totalScore, averageScore
   ```

4. **Navigate to Completion Page**
   - Display quiz results
   - Fetch and show leaderboard
   - Highlight user's rank

---

## Leaderboard Logic

### Ranking Calculation
Users are ranked by `totalScore` in descending order:
- Higher total score = Better rank
- Rank 1 = Highest total score
- Ties are handled by document order

### Display Format

**Top 3 (Podium):**
- 1st place: Gold theme, center position, largest
- 2nd place: Silver theme, left position, medium
- 3rd place: Bronze theme, right position, medium

**Remaining (Scrollable List):**
- Rank 4+ displayed in scrollable container
- Current user's row highlighted in blue
- Auto-scroll to user's position on load

---

## Example Data

### User Profile Example
```json
{
  "$id": "doc123",
  "userId": "user_abc123",
  "username": "JohnDoe",
  "email": "john@example.com",
  "totalQuizzesTaken": 5,
  "totalQuestionsAnswered": 50,
  "totalCorrect": 42,
  "totalIncorrect": 8,
  "totalScore": 42,
  "averageScore": 84.0,
  "rank": 3
}
```

### Quiz Attempt Example
```json
{
  "$id": "attempt456",
  "userId": "user_abc123",
  "username": "JohnDoe",
  "weekNumber": 1,
  "mode": "practice",
  "totalQuestions": 10,
  "correctAnswers": 8,
  "incorrectAnswers": 2,
  "score": 8,
  "scorePercentage": 80.0,
  "timeTaken": 245,
  "completedAt": "2025-11-23T09:30:00.000Z"
}
```

---

## Environment Variables Required

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
NEXT_PUBLIC_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID=your_quiz_attempts_collection_id
```

---

## Key Features

✅ **Separate Collections** - Clean separation of concerns  
✅ **Cumulative Statistics** - Track overall progress  
✅ **Detailed History** - Individual attempt records  
✅ **Efficient Queries** - Indexed for performance  
✅ **Leaderboard Ready** - Optimized for rankings  
✅ **Scalable Design** - Handles growing user base  

---

## Next Steps

1. Follow `docs/appwrite-setup.md` to create collections
2. Add environment variables to `.env.local`
3. Restart development server
4. Complete a quiz to test the system
5. Check Appwrite Console to verify data
6. View leaderboard on completion page
