# Tasks

Status key: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` dropped

## Quality scan — find low-quality photos

**Goal:** a separate scan mode that scores every photo in the library for blur
and surfaces the worst offenders for review and deletion.

- [x] Add quality scan as a new top-level mode in the app, selectable from the
      scan config UI alongside duplicate detection
- [x] Build quality results view: grid of flagged photos sorted worst-first,
      with select/trash flow reusing the existing trash/undo infrastructure
- [x] Implement Laplacian variance blur scoring in a new dedicated
      `workers/blur-scorer.worker.ts`; `blurScores: Record<string, number>` on
      `quality_results` AppState
- [ ] Add zoom / view-in-Google-Photos to the quality results grid — reuse
      `PhotoViewerModal` with quality-appropriate props (no group navigation;
      keep/trash chip maps to selected-for-trash; left/right navigates within
      the flagged list)
- [ ] Self-review pass: read through the code added so far, evaluate the
      emerging structure, and note anything that could be simplified or that
      feels inconsistent with the existing codebase
- [ ] Architecture document: brainstorm a complete architecture for both scan
      modes, write it to a doc, then compare against what is implemented and
      update the code to close any gaps
- [ ] Calibrate an initial aggressive threshold — flag only extremely blurry
      photos to keep false positives low on the first pass
- [ ] Wire quality scan to reuse the existing media item cache when available
- [ ] Fix debug-limit cache invalidation: store a flag in the cached media item
      list indicating it was built under the debug photo limit; treat the cache
      as stale if the current scan settings differ, forcing a full re-fetch
  - Rationale: without this, switching from debug mode (1k photos) to a full
    scan still uses the 1k watermark for incremental fetch, leaving the library
    permanently incomplete

---

## Backlog

- [-] Blur detection within duplicate groups — superseded by the quality scan
  mode above, which solves the broader problem
- [ ] Storage-impact sorting — sort duplicate groups by how much space trashing
      them would free, so users can prioritize high-impact decisions first
- [ ] Remove debug photo limit — disable `debugPhotoLimit` default and consider
      removing the feature entirely once development is complete
  - Note: `DEFAULT_SETTINGS.debugPhotoLimit` is currently `true`; revert
    before release
