# GraphQL

- xScale:

```
Example:

Let's say your date range is from January 1 to December 31
Your chart width is 400 pixels
For a date of July 1 (halfway through the year):

(July 1 - Jan 1) / (Dec 31 - Jan 1) ≈ 0.5 (50% through the date range)
0.5 * 400 = 200 pixels from the left edge
```

- yScale:

```
Example:

Let's say your maximum XP is 1000
Your chart height is 240 pixels
For an XP value of 250:

250 / 1000 = 0.25 (25% of maximum XP)
0.25 * 240 = 60 pixels
240 - 60 = 180 pixels from the top edge
```

- Math.cos and Math.sin:
```
If radius = 100:

At 0 degrees: cos = 1, sin = 0
Point is at (100, 0) = right edge

At 90 degrees: cos = 0, sin = 1
Point is at (0, 100) = bottom edge

At 180 degrees: cos = -1, sin = 0
Point is at (-100, 0) = left edge

At 270 degrees: cos = 0, sin = -1
Point is at (0, -100) = top edge
```