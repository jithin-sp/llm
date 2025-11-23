# Appwrite Collection Setup Guide

This guide will help you set up the required Appwrite collections for the quiz progress tracking and leaderboard system.

## Prerequisites

- Appwrite instance running (cloud or self-hosted)
- Admin access to Appwrite Console
- Project already created

## Step 1: Create Database

1. Go to your Appwrite Console
2. Navigate to **Databases**
3. Click **Create Database**
4. Name it: `quiz-database` (or your preferred name)
5. Copy the **Database ID** and add it to your `.env.local`:
   ```
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
   ```

## Step 2: Create Collections

### Collection 1: Users Profile Collection

**Collection Name:** `users`

#### Attributes

Create the following attributes in order:

| Attribute Key | Type | Size | Required | Array | Default |
|--------------|------|------|----------|-------|---------|
| `userId` | String | 255 | ✅ Yes | ❌ No | - |
| `username` | String | 100 | ✅ Yes | ❌ No | - |
| `email` | String | 255 | ❌ No | ❌ No | - |
| `totalQuizzesTaken` | Integer | - | ✅ Yes | ❌ No | 0 |
| `totalQuestionsAnswered` | Integer | - | ✅ Yes | ❌ No | 0 |
| `totalCorrect` | Integer | - | ✅ Yes | ❌ No | 0 |
| `totalIncorrect` | Integer | - | ✅ Yes | ❌ No | 0 |
| `totalScore` | Integer | - | ✅ Yes | ❌ No | 0 |
| `averageScore` | Double | - | ✅ Yes | ❌ No | 0.0 |
| `rank` | Integer | - | ❌ No | ❌ No | - |
| `carrots` | Integer | - | ✅ Yes | ❌ No | 12 |
| `unlockedWeeks` | Integer | - | ✅ Yes | ✅ **Yes** | - |

#### Indexes

Create these indexes for better query performance:

1. **Index Name:** `userId_unique`
   - Type: Unique
   - Attributes: `userId` (ASC)

2. **Index Name:** `totalScore_desc`
   - Type: Key
   - Attributes: `totalScore` (DESC)

3. **Index Name:** `averageScore_desc`
   - Type: Key
   - Attributes: `averageScore` (DESC)

#### Permissions

Set the following permissions:

- **Read Access:** `Any`
- **Create Access:** `Users`
- **Update Access:** `Users`
- **Delete Access:** `Users`

#### Environment Variable

Copy the **Collection ID** and add to `.env.local`:
```
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id_here
```

---

### Collection 2: Quiz Attempts Collection

**Collection Name:** `quizAttempts`

#### Attributes

Create the following attributes in order:

| Attribute Key | Type | Size | Required | Array | Default |
|--------------|------|------|----------|-------|---------|
| `userId` | String | 255 | ✅ Yes | ❌ No | - |
| `username` | String | 100 | ✅ Yes | ❌ No | - |
| `weekNumber` | Integer | - | ✅ Yes | ❌ No | - |
| `mode` | String | 50 | ✅ Yes | ❌ No | - |
| `totalQuestions` | Integer | - | ✅ Yes | ❌ No | - |
| `correctAnswers` | Integer | - | ✅ Yes | ❌ No | - |
| `incorrectAnswers` | Integer | - | ✅ Yes | ❌ No | - |
| `score` | Integer | - | ✅ Yes | ❌ No | - |
| `scorePercentage` | Double | - | ✅ Yes | ❌ No | - |
| `timeTaken` | Integer | - | ❌ No | ❌ No | - |
| `completedAt` | DateTime | - | ✅ Yes | ❌ No | - |

#### Indexes

Create these indexes:

1. **Index Name:** `userId_key`
   - Type: Key
   - Attributes: `userId` (ASC)

2. **Index Name:** `weekNumber_key`
   - Type: Key
   - Attributes: `weekNumber` (ASC)

3. **Index Name:** `completedAt_desc`
   - Type: Key
   - Attributes: `completedAt` (DESC)

4. **Index Name:** `userId_weekNumber`
   - Type: Key
   - Attributes: `userId` (ASC), `weekNumber` (ASC)

#### Permissions

Set the following permissions:

- **Read Access:** `Any`
- **Create Access:** `Users`
- **Update Access:** `Users`
- **Delete Access:** `Users`

#### Environment Variable

Copy the **Collection ID** and add to `.env.local`:
```
NEXT_PUBLIC_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID=your_quiz_attempts_collection_id_here
```

---

## Step 3: Update Environment Variables

Your `.env.local` file should now have:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id

# Database IDs
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
NEXT_PUBLIC_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID=your_quiz_attempts_collection_id
```

## Step 4: Restart Development Server

After updating environment variables, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 5: Test the Setup

1. Complete a quiz in practice or shuffle mode
2. Check the Appwrite Console:
   - Verify a new document was created in `users` collection
   - Verify a new document was created in `quizAttempts` collection
3. Complete another quiz and verify stats update correctly
4. Check the leaderboard page to see rankings

## Troubleshooting

### Error: "Collection not found"
- Verify collection IDs in `.env.local` match Appwrite Console
- Ensure you've restarted the dev server after updating env variables

### Error: "Missing required attribute"
- Double-check all attributes are created with correct types
- Ensure required fields are marked as required

### Error: "Unauthorized"
- Check collection permissions allow `Users` to create/update
- Verify user is authenticated before taking quiz

### Leaderboard not showing data
- Ensure at least one quiz has been completed
- Check browser console for errors
- Verify database and collection IDs are correct

## Optional: Sample Data

To test the leaderboard with sample data, you can manually create documents in the `users` collection via Appwrite Console:

```json
{
  "userId": "user123",
  "username": "TestUser1",
  "email": "test1@example.com",
  "totalQuizzesTaken": 5,
  "totalQuestionsAnswered": 50,
  "totalCorrect": 42,
  "totalIncorrect": 8,
  "totalScore": 42,
  "averageScore": 84.0,
  "rank": null
}
```

Repeat with different usernames and scores to populate the leaderboard.
