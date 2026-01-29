# Versioning Guide

This document explains the versioning strategy for `react-native-card-swiper`.

## Semantic Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/). Given a version number `MAJOR.MINOR.PATCH`:

- **MAJOR** version: Incompatible API changes (breaking changes)
- **MINOR** version: New functionality in a backward-compatible manner
- **PATCH** version: Backward-compatible bug fixes

### Examples

- `0.1.0 → 0.1.1` - Bug fix (patch)
- `0.1.0 → 0.2.0` - New feature, backward compatible (minor)
- `0.1.0 → 1.0.0` - Breaking change (major)

## How to Release a New Version

### 1. Manual Method

```bash
# 1. Update CHANGELOG.md
# Add your changes under "Unreleased" section

# 2. Bump version and create git tag
npm version patch  # or minor, or major
# This will:
#   - Update package.json version
#   - Create a git commit
#   - Create a git tag (e.g., v0.1.1)
#   - Push to remote (via postversion script)

# 3. Move CHANGELOG.md changes from Unreleased to the new version
# Edit CHANGELOG.md and add:
## [0.1.1] - YYYY-MM-DD
### Fixed
- Your bug fix description
```

### 2. Quick Scripts

Use the npm scripts for common version bumps:

```bash
# Patch version (0.1.0 → 0.1.1)
npm run version:patch

# Minor version (0.1.0 → 0.2.0)
npm run version:minor

# Major version (0.1.0 → 1.0.0)
npm run version:major
```

These scripts automatically:
1. Bump the version in `package.json`
2. Create a git commit with the version number
3. Create an annotated git tag
4. Push changes and tags to the remote repository

## Changelog Maintenance

### Keep a Changelog Format

We use the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]

### Added
- New features go here

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

## [0.1.1] - 2026-01-30

### Fixed
- Fixed overlay border radius issue
```

### Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security-related changes

## Git Tags

All releases are tagged with an annotated tag in the format `vMAJOR.MINOR.PATCH`:

```bash
# View all tags
git tag -l

# View tag details
git show v0.1.0

# Create a tag manually (not recommended, use npm version instead)
git tag -a v0.1.1 -m "Release version 0.1.1"

# Push tags to remote
git push --tags
```

## Pre-release Versions

For alpha, beta, or release candidate versions:

```bash
# Alpha
npm version 0.2.0-alpha.0

# Beta
npm version 0.2.0-beta.0

# Release candidate
npm version 0.2.0-rc.0
```

## Breaking Changes Checklist

Before releasing a **MAJOR** version with breaking changes:

- [ ] Document all breaking changes in CHANGELOG.md
- [ ] Update README.md with new API documentation
- [ ] Add migration guide if needed
- [ ] Update TypeScript types
- [ ] Test with example apps
- [ ] Consider deprecation warnings in the previous version

## Version Workflow Example

Here's a complete workflow for releasing version `0.1.1`:

```bash
# 1. Make your changes and commit them
git add .
git commit -m "fix: prevent overlay overflow"

# 2. Update CHANGELOG.md
# Add entry under "Unreleased":
## [Unreleased]
### Fixed
- Prevented overlay from overflowing card boundaries

# 3. Commit the changelog
git add CHANGELOG.md
git commit -m "docs: update changelog for v0.1.1"

# 4. Bump version (creates tag and pushes)
npm run version:patch

# 5. Update CHANGELOG.md to move from Unreleased to 0.1.1
## [0.1.1] - 2026-01-30
### Fixed
- Prevented overlay from overflowing card boundaries

# 6. Commit the updated changelog
git add CHANGELOG.md
git commit -m "docs: finalize changelog for v0.1.1"
git push

# 7. Create GitHub release (if applicable)
# Go to GitHub → Releases → Create release from tag v0.1.1
```

## Publishing to npm

If you plan to publish this package to npm:

```bash
# 1. Login to npm (first time only)
npm login

# 2. Publish
npm publish

# For pre-release versions
npm publish --tag beta
```

## Version History

- **v0.1.0** (2026-01-29) - Initial release

## References

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [npm version documentation](https://docs.npmjs.com/cli/v9/commands/npm-version)
