# Ultimate Quiz Feature

## Overview
Added a 13th "Ultimate Quiz" that combines all questions from weeks 1-12 in shuffled order, featuring a castle icon with gold shine effect and a special 5-hour free unlock promotion.

## Changes Made

### 1. Data Layer (`src/lib/data.js`)
- Added `getAllQuestions()` function that fetches and combines all questions from all weeks

### 2. Roadmap Component (`src/components/Roadmap.js`)
- Added 13th position for Ultimate Quiz at top of roadmap (50%, 10%)
- Updated `getStatus()` to unlock Ultimate Quiz only when all 12 weeks are unlocked
- Passes `isUltimate` prop to Hole component

### 3. Hole Component (`src/components/Hole.js`)
- **Castle Icon**: Shows 🏰 emoji instead of regular hole
- **Gold Shine Effect**: Subtle animated gold gradient overlay (3s loop)
- **Larger Size**: 24x24 (w-24 h-24) vs regular 16x16
- **Grayscale when locked**: Visual feedback for locked state
- **Pulse animation when completed**: Celebrates completion
- Label says "Ultimate Quiz" in gold text

### 4. HoleOptions Component (`src/components/HoleOptions.js`)
- Ultimate Quiz shows only "Start Ultimate Quiz" button (no learn/practice modes)
- Special purple gradient styling for Ultimate Quiz options

### 5. Home Page (`src/app/home/page.js`)
- **Unlock Modal**: Beautiful gradient modal with castle icon
- **Cost System**: 5 carrots to unlock (or FREE with special offer)
- **Special 5-Hour Offer**: 
  - Activatable button to get free unlock for 5 hours
  - Live countdown timer showing time remaining
  - Stored in localStorage with timestamp
  - Auto-expires after 5 hours
- **Proper Validation**: Checks if all 12 weeks are unlocked
- **Error Handling**: Shows "not enough carrots" message
- Updated total weeks to 13 (affects progress percentage)
- Routes Ultimate Quiz to `/quiz/ultimate/shuffle`

### 6. Quiz Interface (`src/components/QuizInterface.js`)
- Detects `weekNumber === 'ultimate'` or `weekNumber === 13`
- Loads all questions using `getAllQuestions()` for Ultimate Quiz
- Shows special "🏆 Ultimate" badge in header
- Saves results with weekNumber = 13 to database

### 7. Game Context (`src/context/GameContext.js`)
- Updated `unlockWeek()` to accept custom cost parameter
- Default cost is 1 carrot, but Ultimate Quiz can use 0 or 5
- Properly handles free unlocks (cost = 0)

## User Experience

### Unlock Flow
1. **Requirement**: Complete all 12 weeks first
2. **Click Castle**: Opens beautiful unlock modal
3. **Two Options**:
   - **Pay 5 Carrots**: Instant unlock
   - **Activate Special Offer**: Free for next 5 hours
4. **Special Offer**: 
   - One-time activation per 5-hour period
   - Live countdown timer
   - Automatically expires
   - Can be reactivated after expiry

### Visual Design
- **Castle Icon**: 🏰 with subtle gold shine animation
- **Modal**: Gradient background (yellow-orange) with decorative shine effect
- **Special Offer Banner**: Green gradient with sparkle icons
- **Cost Display**: Clear pricing with strikethrough for free offer
- **Countdown Timer**: Real-time display of remaining time

### Quiz Details
- **Mode**: Shuffle only (all questions randomized)
- **Questions**: All questions from weeks 1-12 combined
- **Tracking**: Results saved to Appwrite with weekNumber = 13
- **Badge**: Shows "🏆 Ultimate" in quiz header

## Technical Details

### localStorage Keys
- `ultimateQuizSpecialOffer`: Stores `{ startTime: timestamp }`
- Checked every second for expiry
- Automatically cleaned up after 5 hours

### Cost Logic
```javascript
const cost = isSpecialOffer ? 0 : 5;
unlockWeek(13, cost);
```

### Time Calculation
- 5 hours = 5 * 60 * 60 * 1000 milliseconds
- Format: "Xh Ym Zs"
- Updates every second

## Testing Checklist
- [ ] Ultimate Quiz appears at top of roadmap as castle
- [ ] Castle has subtle gold shine animation
- [ ] Locked until all 12 weeks are unlocked
- [ ] Clicking shows proper unlock modal (not alert)
- [ ] Modal shows "unlock all 12 weeks" message if not ready
- [ ] Cost shows as 5 carrots normally
- [ ] Special offer button activates 5-hour free period
- [ ] Countdown timer displays and updates correctly
- [ ] Free unlock works during special offer period
- [ ] Offer expires after 5 hours
- [ ] Quiz loads all questions shuffled
- [ ] Results save correctly to database
- [ ] Progress percentage includes Ultimate Quiz (13 total)
