# Release Checklist

Quick reference for releasing a new version of `react-native-card-swiper`.

## Pre-Release Checklist

- [ ] All tests pass (`npm run check-types`)
- [ ] Documentation is up to date
- [ ] CHANGELOG.md has all changes listed under `[Unreleased]`
- [ ] Example app works correctly
- [ ] No breaking changes (or documented if MAJOR release)

## Release Steps

### 1. Update CHANGELOG.md

```markdown
## [Unreleased]

### Added
- Your new feature

### Fixed
- Your bug fix
```

### 2. Commit Changes

```bash
git add .
git commit -m "docs: update changelog for release"
```

### 3. Bump Version

```bash
# For bug fixes (0.1.0 → 0.1.1)
npm run version:patch

# For new features (0.1.0 → 0.2.0)
npm run version:minor

# For breaking changes (0.1.0 → 1.0.0)
npm run version:major
```

This automatically:
- Updates `package.json` version
- Creates a git commit
- Creates a git tag (`v0.1.1`)
- Pushes to remote

### 4. Finalize CHANGELOG.md

Move changes from `[Unreleased]` to the new version:

```markdown
## [0.1.1] - 2026-01-30

### Fixed
- Prevented overlay from overflowing card boundaries

## [Unreleased]
```

### 5. Commit and Push

```bash
git add CHANGELOG.md
git commit -m "docs: finalize changelog for v0.1.1"
git push
```

## Post-Release (Optional)

### Publish to npm

```bash
npm publish
```

### Create GitHub Release

1. Go to: `https://github.com/yourusername/react-native-card-swiper/releases`
2. Click "Draft a new release"
3. Choose the tag (e.g., `v0.1.1`)
4. Add release notes from CHANGELOG.md
5. Publish release

## Quick Commands Reference

```bash
# View current version
npm version

# View all tags
git tag -l

# View tag details
git show v0.1.0

# Undo last version bump (if not pushed yet)
git tag -d v0.1.1
git reset --hard HEAD~1
```

## Version Decision Guide

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Bug fix | `patch` | 0.1.0 → 0.1.1 |
| New feature (backward compatible) | `minor` | 0.1.0 → 0.2.0 |
| Breaking change | `major` | 0.1.0 → 1.0.0 |
| Security fix | `patch` | 0.1.0 → 0.1.1 |
| Performance improvement | `patch` | 0.1.0 → 0.1.1 |
| New component | `minor` | 0.1.0 → 0.2.0 |
| API change (breaking) | `major` | 0.1.0 → 1.0.0 |

## Emergency Rollback

If you need to rollback a published version:

```bash
# Unpublish from npm (within 72 hours)
npm unpublish react-native-card-swiper@0.1.1

# Or deprecate the version
npm deprecate react-native-card-swiper@0.1.1 "This version has critical bugs, use 0.1.0 instead"
```

## Notes

- Always update CHANGELOG.md **before** bumping version
- Never force-push tags (`--force` on tags breaks things)
- Pre-release versions: `0.2.0-alpha.0`, `0.2.0-beta.1`, `0.2.0-rc.1`
- Keep git tags and npm versions in sync
