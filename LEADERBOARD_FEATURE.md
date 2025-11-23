# Leaderboard Feature

## What's New

### 1. Leaderboard Page (`/leaderboard`)
- **Global Rankings**: View all players ranked by their quiz performance (total score)
- **Top 3 Highlights**: Special styling for 1st (gold crown), 2nd (silver medal), and 3rd (bronze medal) places
- **Personal Stats Card**: Shows your current rank, total score, quizzes taken, and average score
- **Performance Metrics**: Each player shows total score, number of quizzes taken, and average score percentage
- **Real-time Data**: Fetches live data from Appwrite database
- **User Highlighting**: Your profile is highlighted with a blue ring

### 2. Home Page Updates
- **Leaderboard Button**: Added a trophy icon button in the header to access the leaderboard
- **Improved Layout**: Reorganized header to accommodate the new button

### 3. Enhanced Roadmap Visual
- **Smooth Curved Lines**: Replaced straight lines with organic, hand-drawn style curves
- **Cubic Bezier Curves**: Uses cubic bezier curves for natural S-curve connections between weeks
- **Gradient Path**: Beautiful gradient from blue → purple → yellow following the journey
- **Depth Effect**: Added shadow/outline for a 3D feel
- **Organic Variations**: Each curve has slight variations to feel more hand-drawn

## Technical Details

### Leaderboard Implementation
- Queries Appwrite `users` collection sorted by `totalScore` (descending)
- Displays top 100 players based on quiz performance
- Shows username, total score, quizzes taken, average score, and correct/total questions for each player
- Calculates user rank dynamically based on total score
- Personal stats card shows detailed performance metrics

### Curved Path Algorithm
- Uses cubic bezier curves (`C` command in SVG)
- Control points calculated at 30% and 70% of the distance between points
- Adds organic variation based on position index
- Gradient applied from bottom (blue) to top (yellow)

## Usage

1. **Access Leaderboard**: Click the trophy icon in the home page header
2. **View Rankings**: Scroll through the list to see all players
3. **Find Yourself**: Your profile is highlighted with a blue ring
4. **Return Home**: Click the back arrow in the top-left

## Future Enhancements
- Weekly/monthly leaderboards
- Achievement badges
- Friend rankings
- Score-based rankings (in addition to carrots)
