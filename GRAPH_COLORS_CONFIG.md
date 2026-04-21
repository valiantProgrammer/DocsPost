# Graph Colors Configuration Guide

All graph colors are now managed through CSS variables in `app/globals.css`. This makes it easy to customize them globally across your entire dashboard.

## Available Color Variables

```css
--chart-purple:           #8b5cf6   /* Primary purple - Used in main charts */
--chart-green:            #10b981   /* Green accent - Trends and engagement */
--chart-orange:           #f97316   /* Orange - Views and performance */
--chart-pink:             #ec4899   /* Pink - Engagement rates and likes */
--chart-blue:             #3b82f6   /* Blue - Activity lines */
--chart-cyan:             #06b6d4   /* Cyan - Secondary tooltips */
--chart-secondary-orange: #fb923c   /* Secondary orange - Revenue/bonus */

/* NEW: Grid and Hover Effects */
--chart-grid:             #e5e7eb   /* Grid lines in charts */
--chart-hover-bg:         rgba(139, 92, 246, 0.05)  /* Hover background overlay */
--chart-bar-hover:        #b8a9ff   /* Bar hover highlight color (light theme) */
```

## How to Change Colors

### Step 1: Open the globals.css file
Location: `app/globals.css`

### Step 2: Find the Color Variables Section
Look for the `:root` and `:root[data-theme="dark"]` sections (around line 9-26)

### Step 3: Update the Colors
For example, to change the purple color from `#8b5cf6` to `#a78bfa`:

**Light Theme:**
```css
:root {
  --chart-purple: #a78bfa;  /* Changed from #8b5cf6 */
}
```

**Dark Theme:**
```css
:root[data-theme="dark"] {
  --chart-purple: #a78bfa;  /* Changed from #8b5cf6 */
}
```

## How to Change Bar Hover Color

### For Views & Likes Chart (Bar Chart Hover)

The bar hover colors in the "Top Articles Performance" chart use darker versions of the bar colors:

**Light Theme:**
- Views bars hover: `rgba(249, 115, 22, 0.8)` (darker orange)
- Likes bars hover: `rgba(236, 72, 153, 0.8)` (darker pink)

**To change these colors**, edit the `AnalyticsDashboard.js` file, find the BarChart component and update the `activeBar` props:

```javascript
<Bar
    dataKey="views"
    fill="var(--chart-orange)"
    name="Views"
    radius={[8, 8, 0, 0]}
    activeBar={{ fill: 'rgba(249, 115, 22, 0.8)' }}  // Change this color
/>
<Bar
    dataKey="likes"
    fill="var(--chart-pink)"
    name="Likes"
    radius={[8, 8, 0, 0]}
    activeBar={{ fill: 'rgba(236, 72, 153, 0.8)' }}  // Change this color
/>
```

**Examples of hover colors you can use:**
- Lighter: `rgba(249, 115, 22, 0.5)` (50% opacity)
- Darker: `rgba(249, 115, 22, 1)` (100% opacity - solid)
- Different color: `#ff6b6b` (red)
- Semi-transparent: `rgba(100, 150, 200, 0.7)` (blue)
   - Line charts
   - Bar charts
   - Pie charts
   - Composed charts

2. **AnalyticsDashboard.css** - Styling effects
   - Card hover effects
   - Icon backgrounds
   - Heatmap gradient levels
   - Chart section borders

## Color Mapping in Graphs

### Views & Engagement Trend Chart
- Bar: `--chart-purple`
- Trend Line: `--chart-green`

### Engagement Distribution Pie Chart
- Slice 1: `--chart-purple`
- Slice 2: `--chart-green`
- Slice 3: `--chart-orange`
- Slice 4: `--chart-pink`
- Slice 5: `--chart-blue`

### Top Articles Performance Chart
- Views Bar: `--chart-orange`
- Likes Bar: `--chart-pink`

### Activity Trends Chart
- Activity Line: `--chart-blue`
- Tooltip Border: `--chart-cyan`

### Activity Heatmap (Contribution Graph)
- Level 0 (No activity): `var(--line)` (background line color)
- Level 1-4: Gradient using `--chart-purple` at different opacities

### Icon Colors
- Views Icon: `--chart-purple`
- Engagement Icon: `--chart-pink`
- Session Icon: `--chart-green`
- Active Days Icon: `--chart-orange`
- Avg Session Icon: `--chart-blue`
- Bounce Rate Icon: `--chart-secondary-orange`

## Example Color Schemes You Can Try

### Modern Cool Tones
```css
--chart-purple: #7c3aed
--chart-green: #06b6d4
--chart-orange: #0891b2
--chart-pink: #06b6d4
--chart-blue: #3b82f6
--chart-cyan: #22d3ee
--chart-secondary-orange: #06b6d4
```

### Warm Earth Tones
```css
--chart-purple: #d97706
--chart-green: #059669
--chart-orange: #ea580c
--chart-pink: #dc2626
--chart-blue: #b45309
--chart-cyan: #f97316
--chart-secondary-orange: #f59e0b
```

### Pastel Soft
```css
--chart-purple: #a78bfa
--chart-green: #86efac
--chart-orange: #fed7aa
--chart-pink: #fbcfe8
--chart-blue: #93c5fd
--chart-cyan: #a5f3fc
--chart-secondary-orange: #fecaca
```

## Tips

1. **Grid Lines**: Control grid density with `--chart-grid`. Current density is "1 1" (very fine). Adjust in AnalyticsDashboard.js if needed
2. **Hover Effects**: The `--chart-hover-bg` creates a subtle background tint when hovering over chart sections
3. **Consistency**: Make sure colors are legible against both light and dark backgrounds
4. **Contrast**: Ensure sufficient contrast between chart colors and backgrounds
5. **Accessibility**: Test colors with color-blind friendly palettes
6. **Theme Sync**: Update colors in both `:root` and `:root[data-theme="dark"]` for consistent theming

## Updating in Real-Time

After making changes to `app/globals.css`:
1. Save the file
2. The development server will hot-reload
3. Your dashboard graphs will update automatically
