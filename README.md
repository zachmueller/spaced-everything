# Spaced writing practice (Obsidian plugin)

_[Obsidian](https://obsidian.md/) plugin to apply spaced repetition to incrementally develop your notes._

Borrowing from Andy Matuschak's [notes](https://notes.andymatuschak.org/About_these_notes?stackedNotes=zVFGpprS64TzmKGNzGxq9FiCDnAnCPwRU5T&stackedNotes=z5aJUJcSbxuQxzHr2YvaY4cX5TuvLQT7r27Dz&stackedNotes=z8aZybuJJopS5fL7TnPou2JcmCsBUJeqirbBh&stackedNotes=zJ5Yzvba2729XKXivBBZ91J&stackedNotes=zB92WZZ5baBHKZPPbWMbYEv&stackedNotes=zHwr5v9VJGX3MzHyzz4V8wt&stackedNotes=zDXBGEWk7msyonQ2Ngnrf8h&stackedNotes=zSK4LyrCbG9zDrdCWmcovUW&stackedNotes=z4KxfCZPkVEf2R8nayLJZBG) outlining such a practice, this plugin applies the main concepts of spaced repetition to writing. That is, using the SuperMemo-2.0 algorithm to automatically decide what note to review next when engaging in a Spaced Writing Practice (SWP).

## Features

### Review a note

Taking from Andy's proposed idea, when reviewing a note you can select among three options for how the review went: Fruitful, Unfruitful, or Ignore. Fruitful means you made good progress on the note; this guides the spacing algorithm to include the note again soon in your queue. Unfruitful means you tried to engage with the note but progress was limited; this pushes that note out further in your queue. Ignore is an in-between option.

You may customize these options for this review process. You may add or delete options and change their numeric value. Currently, the only spacing algorithm implemented is the SuperMemo-2.0 algorithm. The numeric value provided in the settings alongside each review option maps to the "review quality score" from that algorithm. Over time, I may experiment with adding alternate spacing algorithms and further customizations.

### Pull up next note in review queue

At any time, you may run the "Open next review note" command to pull up the next note in your review queue. This is calculated based on looking across the SWP frontmatter properties of notes in your vault. From there, it adds the interval value (in days) to the last review timestamp to derive the due date for each note. Then any notes with a due date in the future are filtered out. Among remaining notes, it sorts it by the earliest/oldest due date timestamp first and pulls notes in that order.

### Review contexts

By default, all notes are treated as one large queue of notes to review. However, you may optionally add any number of separate contexts to filter down which subset of notes to include when pulling up the next note in the review queue. When onboarding notes, it will prompt you to select which SWP context to add the note into. You may also run the "Toggle note contexts" command on any note to add/remove the note from any context. 

You can create and remove SWP contexts from within the settings. You may also toggle which contexts are "active" (i.e., only notes matching an active context are considered when going through the review queue). 

TODO::I don't know whether I actually implemented the filtering when running the command to pull up next note in the queue to take into account the contexts::

### Onboard individual notes

Only notes you actively choose to review to onboard are considered for the spaced writing practice review queue. When running the "Log review outcome" command on a note not yet onboarded, it will onboard the note. When conducting the review (using that same command), you may remove any individual note at any time.

### Logging

The actions you take in this spaced writing practice can optionally be logged to a local file. This data is stored in JSONL format. Some customization is possible in the settings, including providing a list of frontmatter properties that you are interested in capturing for whichever note the action was taken on.