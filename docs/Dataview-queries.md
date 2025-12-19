# Dataview Query Guide

This guide covers advanced customization and integration patterns for power users of Spaced Everything. For basic setup and usage, refer to the main [README](../README.md).

> **Alternative Approach:** If you prefer a built-in solution without plugins, see the [Bases Query Guide](./Bases-queries.md) which achieves similar functionality using Obsidian's native Bases feature.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Visualizing Your Review Queue with Dataview](#visualizing-your-review-queue-with-dataview)
  - [Understanding the Plugin's Queue Logic](#understanding-the-plugins-queue-logic)
  - [Basic Review Queue Query](#basic-review-queue-query)
  - [Filtered Queue by Context](#filtered-queue-by-context)
  - [Advanced Customizations](#advanced-customizations)
- [Troubleshooting](#troubleshooting)
- [Integration Ideas](#integration-ideas)
- [Contributing](#contributing)

## Prerequisites

### Dataview Plugin

The queries in this guide require the [Dataview plugin](https://github.com/blacksmithgu/obsidian-dataview) for Obsidian.

**Installation:**
1. Open Obsidian Settings
2. Navigate to **Community plugins** and disable **Safe mode** (if not already disabled)
3. Click **Browse** and search for "Dataview"
4. Click **Install**, then enable the plugin

**Learning Dataview:**
- [Official Dataview Documentation](https://blacksmithgu.github.io/obsidian-dataview/)
- [Query Language Reference](https://blacksmithgu.github.io/obsidian-dataview/queries/structure/)

## Visualizing Your Review Queue with Dataview

While Spaced Everything's "Open next item for review" command shows one note at a time, you might want to visualize your entire review queue. Dataview queries can replicate the plugin's queue logic, letting you see all upcoming reviews at once.

### Understanding the Plugin's Queue Logic

The plugin determines which notes to review using this logic:

1. **Calculate due date**: Add `se-interval` (in days) to `se-last-reviewed` timestamp
2. **Filter overdue**: Keep only notes where due date ≤ current date
3. **Filter by context**: If contexts are active, include only matching notes
4. **Sort by urgency**: Order by due date (oldest first)

The queries below replicate this logic visually.

### Basic Review Queue Query

This query shows all notes currently due for review, regardless of context.

````markdown
```dataview
TABLE 
    se-last-reviewed as "Last Reviewed",
    interval as "Interval (Days)",
    due-date as "Due Date"
    
FLATTEN dur(se-interval + " d") as interval
FLATTEN se-last-reviewed + interval as due-date

WHERE se-interval != null 
    AND se-last-reviewed != null
    AND due-date <= date(now)
    
SORT due-date ASC
LIMIT 50
```
````

**How it works:**
- `FLATTEN` creates computed fields for interval and due date
- `dur(se-interval + " d")` converts the numeric interval to a duration
- `se-last-reviewed + interval` calculates when the note is next due
- `WHERE` filters to only show onboarded notes that are currently due
- `SORT` orders by urgency (oldest due date first)
- `LIMIT` restricts to only showing the top N results

**Example output:**

| File | Last Reviewed | Interval (Days) | Due Date |
|------|---------------|-----------------|----------|
| Meeting Notes | 2025-12-11T09:30:00 | 5 days | 2025-12-16T09:30:00 |
| Project Ideas | 2025-12-10T14:00:00 | 7 days | 2025-12-17T14:00:00 |
| Research Paper | 2025-12-15T16:45:00 | 2 days | 2025-12-17T16:45:00 |

### Filtered Queue by Context

Filter your review queue to specific contexts (e.g., "Work", "Personal", "Learning"). Add one of the following to the `WHERE` clause:

**Single context:**
```sql
    AND contains(se-contexts, "Work")
```

**Multiple contexts (OR logic):**
```sql
    AND (contains(se-contexts, "Work") 
    OR contains(se-contexts, "Personal"))
```

**Multiple contexts (AND logic - note must have both):**
```sql
    AND (contains(se-contexts, "Work") 
    AND contains(se-contexts, "Learning"))
```

**Exclude a context:**
```sql
    AND (se-contexts != null 
    AND !contains(se-contexts, "Archive"))
```

**Notes:**
- Context names are case-sensitive: `"Work"` ≠ `"work"`
- Use `se-contexts` (plural) as the property name, not `se-context`

### Advanced Customizations

#### Show Next 7 Days (Not Just Overdue)

See notes due within the next week, helpful for planning ahead.

Change:

```sql
    AND due-date <= date(now)
```

To:
```sql
    AND due-date <= date(now) + dur(7 d)
```

#### Show Multiple Contexts as Comma-Separated List

Format context arrays nicely by adding the following just after `TABLE`:

```sql
    join(se-contexts, ", ") as "Contexts",
```

**Output example:**
- `Work, Learning` (note has two contexts)
- `Personal` (note has one context)
- ` ` (note has no contexts)

#### Calculate Days Overdue

Show how many days past due each note is:

````markdown
```dataview
TABLE 
    se-last-reviewed as "Last Reviewed",
    interval as "Interval (Days)",
    due-date as "Due Date",
    days-overdue as "Days Overdue"
    
FLATTEN dur(se-interval + " d") as interval
FLATTEN se-last-reviewed + interval as due-date
FLATTEN round((date(now) - due-date).days) as days-overdue

WHERE se-interval != null 
    AND se-last-reviewed != null
    AND due-date <= date(now)
    
SORT due-date ASC
LIMIT 50
```
````

#### Group by Context

Organize your queue by context:

````markdown
```dataview
TABLE 
    se-last-reviewed as "Last Reviewed",
    interval as "Interval (Days)",
    due-date as "Due Date"
    
FLATTEN dur(se-interval + " d") as interval
FLATTEN se-last-reviewed + interval as due-date

WHERE se-interval != null 
    AND se-last-reviewed != null
    AND due-date <= date(now)
    
GROUP BY se-contexts
SORT due-date ASC
LIMIT 50
```
````

#### Custom Date Formatting

Display dates in your preferred format:

Change:

```sql
    se-last-reviewed as "Last Reviewed",
```

To:
```sql
    dateformat(se-last-reviewed, "MMM dd, yyyy") as "Last Reviewed",
```

**Common date format patterns:**
- `"yyyy-MM-dd"`: 2025-12-18
- `"MMM dd, yyyy"`: Dec 18, 2025
- `"dd/MM/yyyy HH:mm"`: 18/12/2025 14:30
- `"EEEE, MMMM dd"`: Wednesday, December 18

## Troubleshooting

### Query Returns No Results

**Possible causes:**

1. **No notes are onboarded yet**
   - Solution: Onboard notes using `Spaced Everything: Log review outcome`
   - Check: Look for notes with `se-interval` frontmatter property

2. **No notes are currently due**
   - Solution: Remove or adjust the `due-date <= date(now)` filter
   - Test: Change to `due-date <= date(now) + dur(30 d)` to see future reviews

3. **Dataview isn't indexing your notes**
   - Solution: Open Settings → Dataview → Refresh Index
   - Wait a few seconds and try the query again

### Context Filter Not Working

**Possible causes:**

1. **Case sensitivity mismatch**
   - Check: Context names are case-sensitive
   - Example: `"Work"` in query vs. `"work"` in frontmatter won't match

2. **Property name typo**
   - Check: Use `se-contexts` (plural), not `se-context`
   - Verify: Open a note and check the exact property name

3. **Context is an array**
   - Solution: Use `contains(se-contexts, "Work")` not `se-contexts = "Work"`
   - The `contains()` function works with both strings and arrays

### Date Comparison Errors

**Possible causes:**

1. **Timezone inconsistencies**
   - Check: Settings → Spaced Everything → Timestamp timezone
   - Note: Mixing UTC and local timestamps can cause issues

2. **Manually edited timestamps**
   - Check: Ensure timestamps follow ISO 8601 format
   - Example: `2025-12-18T14:30:00Z` (with timezone) or `2025-12-18T14:30:00`

3. **Missing timezone in timestamps**
   - Solution: Dataview uses the configured `timestampTimeZone` setting to interpret ambiguous timestamps

### Query Runs Slowly

**Possible causes:**

1. **Complex WHERE conditions**
   - Solution: Simplify filters or create multiple simpler queries
   - Tip: Check each WHERE condition independently

2. **Dataview cache is stale**
   - Solution: Settings → Dataview → Refresh Index

## Integration Ideas

### Dashboard Note

Create a dedicated review dashboard note:

````markdown
# Review Dashboard

## Overdue Reviews
[Basic queue query here]

## Next 7 Days
[7-day lookahead query here]

## By Context

### Work Queue
[Work context query here]

### Personal Queue
[Personal context query here]

## Statistics
- Total onboarded: `=length(filter(file.lists.all, (x) => x.se-interval != null))`
- Due today: [Query with COUNT]
````

### Daily Note Integration

Embed your review queue in daily notes:

````markdown
# {{date}} Daily Note

## Today's Reviews
```dataview
[Basic queue query]
LIMIT 10
```

## Tasks
- [ ] Review top 3 notes
- [ ] ...
````

### Periodic Review Note

Track review patterns over time:

````markdown
# Weekly Review - Week of {{date}}

## Completed This Week
```dataview
TABLE se-last-reviewed as "Reviewed"
WHERE se-last-reviewed >= date({{date}}) 
    AND se-last-reviewed < date({{date}}) + dur(7 d)
SORT se-last-reviewed DESC
```

## Coming Up Next Week
[7-day lookahead query]
````

## Contributing

These query patterns originated from the Spaced Everything community. Special thanks to [@menkaru](https://github.com/menkaru) for contributing the initial query example on [GitHub Issue #21](https://github.com/zachmueller/spaced-everything/issues/21).

**Share your own patterns:**
- Post queries in [GitHub Discussions](https://github.com/zachmueller/spaced-everything/discussions)
- Submit improvements via pull requests
- Report issues with queries on [GitHub Issues](https://github.com/zachmueller/spaced-everything/issues)

**Ideas for future contributions:**
- Statistics and analytics queries
- Integration patterns with other plugins
