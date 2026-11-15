# Git Workflow

This document outlines the conventions for using Git and writing commit messages in this project.

## Commit Message Format

All commit messages should follow this format:

```
<type>: <subject>

<body (optional)>
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `config`: Changes to configuration files
- `chore`: Changes to the build process or auxiliary tools and libraries

**Examples:**

```
feat: Add dark mode toggle button to header
fix: Preserve section bookmarks in the Experience redirect
docs: Update README.md with Docker troubleshooting
style: Format Node sources with Prettier
config: Update the Node deployment workflow
chore: Remove unused npm dependencies
```

## Staging Changes

**Always `git add` files explicitly.** Do not stage everything with `git add .` unless you are certain of what's being committed. Check `git status` first to review your changes.

## What NOT to Commit

**Always obey the project's [`.gitignore`](../.gitignore) file.** It prevents the accidental commit of:

- Build outputs (`_site/`, `test-results/`, `playwright-report/`)
- Dependencies and caches (`node_modules/`, `.npm-cache/`)
- OS-specific files (`.DS_store`)
- Editor temporary files (`.idea/`, `.swp`, `.swo`)
- Secrets and API keys (never commit credentials)

Before committing site changes, run the checks listed in [AGENTS.md](../AGENTS.md). Review the diff for unrelated user changes before staging.
