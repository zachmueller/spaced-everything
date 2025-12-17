# Task Tracking Standards

## MANDATORY: Keep tasks.md Synchronized

**When a `tasks.md` file exists and is being used to guide work, Cline MUST keep it up-to-date throughout the implementation process.**

### Core Requirement

If you are working from a `tasks.md` file (or any task tracking document referenced in the spec/plan):
- ✅ Update task status IMMEDIATELY after completing each step
- ✅ Add notes about implementation decisions or blockers
- ✅ Mark tasks as complete when verified working
- ✅ Update task descriptions if scope changes

### Update Triggers

Update the `tasks.md` file when:
1. **Completing a task** - Mark as complete `[x]`
2. **Starting a task** - Add "In Progress" indicator if needed
3. **Discovering blockers** - Add notes about what's blocking progress
4. **Scope changes** - Update task description to match reality
5. **Breaking down tasks** - Add sub-tasks if original task needs decomposition
6. **Finishing a work session** - Ensure status reflects current state

### Update Format

```markdown
- [x] Task description
  - Implementation notes if relevant
  - Any decisions made or issues encountered

- [-] Task in progress
  - Current status or blocker notes

- [ ] Future task (not yet started)
```

**Status Indicators:**
- `[x]` = Complete
- `[-]` = In Progress (actively working on)
- `[ ]` = Not Yet Started

### When to Update

**During Implementation:**
- After each significant file modification
- When completing logical chunks of work
- Before committing changes to git
- Before responding to user with completion status

**DO NOT:**
- ❌ Leave tasks.md stale while making progress
- ❌ Bulk update all tasks at the end
- ❌ Forget to mark dependencies completed
- ❌ Update only when user asks for status

### Integration with Git Workflow

After completing a reasonable chunk of successful progress (not necessarily after each individual task):
1. Update `tasks.md` status for all work completed in that chunk
2. Stage the updated `tasks.md` along with implementation files
3. Follow the commit standards defined in `.clinerules/git.md`
4. Include task progress updates in your commit message

**Note:** You don't need to commit after every single task completion. Commit when you've made meaningful progress worth preserving - this might include several completed tasks or one significant milestone.

### Task File Location Patterns

Task files may appear at:
- `specs/{spec-name}/tasks.md` - Most common
- `specs/{spec-name}/checklists/*.md` - Detailed checklists
- Project root `tasks.md` - Project-wide tasks

**Always check spec/plan documents to identify which task files are in use.**

### Constitutional Alignment

This rule supports:
- **Specification-First Development**: Tasks derive from specs, keeping them current maintains spec integrity
- **Documentation as Context**: Up-to-date tasks provide essential context for AI and human collaborators
- **Iterative Simplicity**: Real-time updates prevent large documentation debt

### Quality Standards

- Task updates should be atomic with the work they describe
- Task notes should provide context for future work
- Task status should accurately reflect current implementation state
- Task files should be committed alongside implementation changes
