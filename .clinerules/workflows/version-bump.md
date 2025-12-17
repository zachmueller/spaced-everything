# Version Bump Workflow

**Type:** `version-bump.md`  
**Purpose:** Automate version bumping, changelog updates, and git tag creation for plugin releases  
**Dependencies:** Python 3 with standard libraries, git

## Overview

This workflow automates the complete version bump process for the Multi Git Obsidian plugin:
1. Validates and determines version bump type (major/minor/patch)
2. Updates version numbers in `manifest.json` and `package.json`
3. Reviews commit history and updates `CHANGELOG.md`
4. Creates and pushes annotated git tags following Obsidian plugin release standards

## When to Use

- Before releasing a new version of the plugin
- When preparing to publish an update to the Obsidian plugin community
- As part of the release preparation workflow

## Prerequisites

- Clean working directory (commit or stash changes first)
- Python 3 installed with standard libraries
- Git repository properly configured
- Appropriate permissions to push tags to origin

## Workflow Steps

### Step 1: Determine Version Bump Type

**Action:** If the user hasn't specified a bump type, ask them to provide it.

**Implementation:**
- Check if user provided bump type (`major`, `minor`, or `patch`) in their initial request
- If not provided, use `ask_followup_question` tool with these options:
  - `patch` - Bug fixes and minor updates (0.1.0 → 0.1.1)
  - `minor` - New features, backward compatible (0.1.0 → 0.2.0)
  - `major` - Breaking changes (0.1.0 → 1.0.0)

**Validation:**
- Bump type must be one of: `major`, `minor`, `patch`
- User should understand semantic versioning implications

### Step 2: Run Version Bump Script

**Action:** Execute the Python script to update version numbers.

**Implementation:**
```bash
python3 scripts/bump_version.py <bump_type>
```

**Expected Output:**
- Script prints new version number on first line (e.g., `0.2.0`)
- Script prints current date on second line (e.g., `2025-12-17`)
- Both `manifest.json` and `package.json` are updated with new version
- Script exits with code 0 on success

**Error Handling:**
- If script fails, check error messages on stderr
- Verify files exist and are properly formatted JSON
- Ensure current version in manifest.json follows semantic versioning

**Capture the Output:**
- Store the new version number from the first line of stdout
- Store the current date from the second line of stdout
- Example: If script outputs `0.2.0` and `2025-12-17`, use these values in subsequent steps
- These values will be used for the changelog header and git operations

### Step 3: Review Commit History and Update CHANGELOG.md

**Action:** Review commits since last version tag and update the changelog.

**Implementation:**
1. **Find the last version tag:**
   ```bash
   git describe --tags --abbrev=0 --match "[0-9]*.[0-9]*.[0-9]*"
   ```
   
2. **Get commit history since last tag:**
   ```bash
   git log <last_tag>..HEAD --oneline --no-merges
   ```
   
3. **Review and categorize commits:**
   - Read through the commit messages
   - Identify significant changes, features, fixes, and improvements
   - Look for commits marked with conventional commit types (feat:, fix:, docs:, etc.)
   - Pay attention to commits prefixed with `[Cline]` to understand AI-generated changes

4. **Update CHANGELOG.md:**
   - Use `read_file` to read current `CHANGELOG.md`
   - Add new version section at the top (after the header, before previous versions)
   - **Use the version number and date from the script output** for the changelog header
   - Follow this format:
     ```markdown
     ## [X.Y.Z] - YYYY-MM-DD
     
     ### Added
     - New features or capabilities
     
     ### Changed
     - Changes to existing functionality
     
     ### Fixed
     - Bug fixes
     
     ### Deprecated
     - Features marked for removal (if applicable)
     
     ### Removed
     - Features removed (if applicable)
     
     ### Security
     - Security improvements (if applicable)
     ```
   - **IMPORTANT:** The `[X.Y.Z]` should be the version from script output line 1, and `YYYY-MM-DD` should be the date from script output line 2
   - Organize commits into appropriate categories
   - Write clear, user-focused descriptions
   - Include links to issues/PRs if referenced in commits
   - Use `replace_in_file` or `write_to_file` to update the changelog

**Quality Standards:**
- Changelog entries should be written for end users, not developers
- Focus on impact and functionality, not implementation details
- Use present tense (e.g., "Add feature" not "Added feature")
- Be specific and descriptive
- Include breaking changes prominently if this is a major version bump

### Step 4: Commit Version Changes

**Action:** Commit the version number updates and changelog changes.

**Implementation:**
```bash
git add manifest.json package.json CHANGELOG.md
git commit -m "[Cline] Version Bump: Release v<new_version>

- Updated version to <new_version> in manifest.json and package.json
- Updated CHANGELOG.md with release notes

---

Workflow: version-bump.md
<human_input>"
```

**Requirements:**
- Follow the git commit standards from `.clinerules/git.md`
- Include `[Cline]` prefix
- Include `Workflow: version-bump.md` line
- Include the human's original prompt after the `---` separator
- Be specific about what was updated

### Step 5: Create and Push Git Tag

**Action:** Create annotated git tag and push it to origin, following Obsidian plugin release standards.

**Implementation:**

1. **Create annotated tag:**
   ```bash
   git tag -a <new_version> -m "<new_version>"
   ```
   
   **Important Notes:**
   - Tag name must match the version in `manifest.json` exactly
   - Use `-a` flag for annotated tag (required by Obsidian release workflow)
   - Tag message should be the version number (Obsidian requirement)
   - Do NOT include 'v' prefix (use `1.0.1` not `v1.0.1`)

2. **Push the tag to origin:**
   ```bash
   git push origin <new_version>
   ```

3. **Verify tag was created:**
   ```bash
   git tag -l "<new_version>"
   ```

**Expected Results:**
- Tag is created locally
- Tag is pushed to GitHub
- If GitHub Actions are configured, the release workflow will trigger automatically
- GitHub will create a draft release with plugin artifacts

**Error Handling:**
- If tag already exists, check if it needs to be updated or if version should be different
- If push fails, verify git remote configuration and permissions
- Ensure you have write access to the repository

### Step 6: Verify and Report

**Action:** Verify the version bump was successful and provide next steps to the user.

**Implementation:**
1. **Verify files were updated:**
   - Check `manifest.json` contains new version
   - Check `package.json` contains new version
   - Check `CHANGELOG.md` has new version section

2. **Verify git operations:**
   - Confirm commit was created
   - Confirm tag was created and pushed
   - Provide git log output showing the new commit

3. **Provide user feedback:**
   ```
   Version bump to <new_version> completed successfully!
   
   ✓ Updated manifest.json and package.json to version <new_version>
   ✓ Updated CHANGELOG.md with release notes
   ✓ Committed changes to git
   ✓ Created and pushed tag <new_version>
   
   Next Steps:
   1. If this is the first release, submit your plugin following:
      https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
      
   2. If this is an update to an existing plugin:
      - Check GitHub Actions tab for release workflow progress
      - Review the draft release on GitHub when ready
      - Add any additional release notes if needed
      - Publish the release
      
   3. GitHub Actions will automatically:
      - Build the plugin
      - Create a draft release
      - Upload main.js, manifest.json, and styles.css
   
   4. After publishing the release:
      - Users will be able to update to the new version
      - The plugin marketplace will reflect the update
   ```

## Error Recovery

### Script Execution Errors
- Verify Python 3 is installed: `python3 --version`
- Check file permissions on `scripts/bump_version.py`
- Ensure script is executable: `chmod +x scripts/bump_version.py`
- Verify JSON files are properly formatted

### Git Operation Errors
- If tag exists: Delete with `git tag -d <version>` and retry
- If push fails: Check remote URL with `git remote -v`
- If no commits found: Ensure you have commits to include in release

### Changelog Update Errors
- If CHANGELOG.md is malformed, recreate from template
- If no commits since last tag, ask user if they want to proceed anyway
- Provide clear categorization even if commit messages aren't conventional

## Quality Standards

### Version Numbering
- Follow semantic versioning strictly (major.minor.patch)
- Major: Breaking changes or major new features
- Minor: New features, backward compatible
- Patch: Bug fixes and minor updates

### Changelog Quality
- Write for end users, not developers
- Be specific and descriptive
- Categorize changes appropriately
- Highlight breaking changes prominently
- Include context for why changes were made

### Git Tag Requirements
- Tag must be annotated (use `-a` flag)
- Tag name must match manifest.json version exactly
- No 'v' prefix on tag name
- Tag message should be the version number

## Constitutional Alignment

This workflow supports:
- **Documentation as Context:** Maintains clear release history via CHANGELOG.md
- **Iterative Simplicity:** Automates repetitive release tasks
- **Specification-First Development:** Ensures version changes are documented and traceable

## Common Use Cases

### Patch Release (Bug Fixes)
```
User: "Bump version for bug fix release"
→ Ask: major/minor/patch?
→ User selects: patch
→ 0.1.0 → 0.1.1
→ Update changelog with fixes
→ Create tag 0.1.1
```

### Minor Release (New Features)
```
User: "Bump to minor version for new auto-pull feature"
→ Determine: minor bump
→ 0.1.0 → 0.2.0
→ Update changelog with new features
→ Create tag 0.2.0
```

### Major Release (Breaking Changes)
```
User: "Release version 1.0.0 with breaking API changes"
→ Determine: major bump
→ 0.9.0 → 1.0.0
→ Update changelog, highlight breaking changes
→ Create tag 1.0.0
```

## Notes

- Always ensure working directory is clean before starting
- Review changelog carefully - this is what users will see
- Tag creation triggers GitHub Actions release workflow automatically
- Draft releases must be manually published on GitHub
- First release requires submission to Obsidian plugin repository

## Related Documentation

- [Obsidian Plugin Release Guide](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- `.clinerules/git.md` - Git commit standards
