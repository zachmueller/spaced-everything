# Roadmap

## Shift towards Spaced Everything

After re-reading various of Andy Matuschak's notes, I want to implement a few additional things and rename this project to "Spaced Everything". For that, some new features:
- Cloze deletions and Q/A stuff often seen throughout Andy's notes

Also, some minor changes of existing code:
- Review full code and documentation for terminology and identify better names to suit the broader scope (e.g., "review queue"). Probably toss all of this into a Glossary doc.
- Restructure some of the plugin settings variables to ensure it's better suited for my long term plans of expanding into more customization

## Later on
Below are some further ideas for things I might want to implement in this plugin:
- Allow for routing things from the writing inbox through different paths (e.g., tag specific templates to execute, directory to place it under, custom frontmatter properties to include, etc). One example usage of this would be Andy's [reading inbox concept](https://notes.andymatuschak.org/zDXBGEWk7msyonQ2Ngnrf8h).
- Enable custom spacing algorithms/approaches for each different context (think about Andy's [example](https://notes.andymatuschak.org/zB92WZZ5baBHKZPPbWMbYEv) for piano exercises where he wants to capture both a subjective rating and a maximum tempo score to then influence the next spacing calculation). This would require allowing users to implement custom JavaScript to derive the updates to the key frontmatter properties used in the spacing calculation.
- With massively different spacing contexts, should implement some easier method for switching between (or toggling) contexts active for the "Open next review note" command
- Maybe implement my [session wrapper template](https://notes.zach.nz/Note-template---Session-wrapper-for-my-spaced-writing-practice) functionality
- Further customization within the SuperMemo-2.0 algorithm
- Implement other spacing algorithms
- Time of day auto-switching between which contexts are active?
