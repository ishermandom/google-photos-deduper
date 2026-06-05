# Tasks

Status key: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` dropped

## Backlog

- [ ] Blur detection — identify blurry photos within a duplicate group so the
      keep/trash recommendation favors sharp images
- [ ] Storage-impact sorting — sort duplicate groups by how much space trashing
      them would free, so users can prioritize high-impact decisions first
- [ ] Remove debug photo limit — disable `debugPhotoLimit` default and consider
      removing the feature entirely once development is complete
  - Note: `DEFAULT_SETTINGS.debugPhotoLimit` is currently `true`; revert
    before release
