# Auto-Scroll to Required Week Feature

## Overview
When a user tries to unlock a higher week without unlocking the required previous weeks, the app automatically scrolls to the week that needs to be unlocked first and shows a tooltip message.

## How It Works

### Scenario 1: Sequential Unlock (Normal Flow)
**User has unlocked:** Week 1, 2, 3  
**User clicks:** Week 4 (locked)  
**Result:** Shows unlock modal for Week 4 ✅

### Scenario 2: Skipping Weeks (Auto-Scroll Triggered)
**User has unlocked:** Week 1, 2, 3  
**User clicks:** Week 7 (locked)  
**Result:**
1. Finds next sequential locked week (Week 4)
2. Auto-scrolls to Week 4
3. Shows tooltip: "👆 Unlock this week first!"
4. Tooltip disappears after 4 seconds

### Scenario 3: Multiple Gaps
**User has unlocked:** Week 1, 2, 5, 6  
**User clicks:** Week 10 (locked)  
**Result:**
1. Finds next sequential locked week (Week 3)
2. Auto-scrolls to Week 3
3. Shows tooltip message
4. User must unlock weeks in order: 3 → 4 → 7 → 8 → 9 → 10

## Technical Implementation

### 1. Find Next Locked Week (`src/app/home/page.js`)
```javascript
const findNextLockedWeek = () => {
    for (let week = 1; week <= 12; week++) {
        if (!unlockedWeeks.includes(week)) {
            return week;
        }
    }
    return null;
};
```
This function iterates from Week 1 to 12 and returns the first locked week.

### 2. Trigger Scroll and Tooltip
```javascript
// Clear existing tooltip
setShowTooltip(false);
setTooltipWeek(null);

// Set new tooltip after small delay (ensures clean state)
setTimeout(() => {
    setTooltipWeek(nextLockedWeek);
    setShowTooltip(true);
}, 50);

// Auto-hide after 4 seconds
setTimeout(() => {
    setShowTooltip(false);
    setTooltipWeek(null);
}, 4050);
```

### 3. Auto-Scroll Logic (`src/components/Roadmap.js`)
```javascript
useEffect(() => {
    if (tooltipWeek && holeRefs.current[tooltipWeek] && containerRef.current) {
        setTimeout(() => {
            const holeElement = holeRefs.current[tooltipWeek];
            const container = containerRef.current;

            // Calculate scroll position to center the hole
            const holeRect = holeElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const scrollTop = container.scrollTop;
            const targetScroll = scrollTop + holeRect.top - containerRect.top - 
                                (containerRect.height / 2) + (holeRect.height / 2);

            container.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }, 100);
    }
}, [tooltipWeek, showTooltip]);
```

## Key Features

✅ **Smooth Scrolling**: Uses `behavior: 'smooth'` for animated scroll  
✅ **Centered View**: Calculates position to center the target week in viewport  
✅ **Visual Feedback**: Blue tooltip with arrow pointing to the week  
✅ **Auto-Hide**: Tooltip disappears after 4 seconds  
✅ **Sequential Logic**: Always finds the first locked week in order  
✅ **Delay Handling**: Small delays ensure DOM is ready and state is clean  

## User Experience Flow

1. **User clicks locked Week 8**
2. **System checks:** Is Week 7 unlocked?
3. **If NO:** 
   - Find first locked week (e.g., Week 4)
   - Scroll to Week 4
   - Show tooltip: "👆 Unlock this week first!"
4. **User sees:** Week 4 centered with tooltip
5. **User action:** Clicks Week 4 to unlock
6. **Repeat:** Until reaching Week 8

## Edge Cases Handled

- **Week 1 always unlockable**: No previous week required
- **Ultimate Quiz (Week 13)**: Shows modal instead of tooltip
- **All weeks unlocked**: No tooltip needed
- **Rapid clicking**: Clears previous tooltip before showing new one
- **DOM not ready**: 100ms delay ensures elements exist

## Visual Design

**Tooltip Style:**
- Background: Blue (#2563eb)
- Text: White
- Icon: 👆 pointing finger
- Arrow: Points down to the week
- Position: Above the week hole
- Animation: Fade in/out with scale

## Testing Scenarios

1. ✅ Click Week 5 when only Week 1-2 unlocked → Scrolls to Week 3
2. ✅ Click Week 12 when only Week 1 unlocked → Scrolls to Week 2
3. ✅ Click Week 4 when Week 1-3 unlocked → Shows unlock modal (no scroll)
4. ✅ Tooltip auto-hides after 4 seconds
5. ✅ Smooth scroll animation works
6. ✅ Week is centered in viewport
