// Copyright 2025 Ilya Sherman (ishermandom@)
// SPDX-License-Identifier: MIT
import { useMemo } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import type { GpdMediaItem } from "../lib/types"

// Laplacian variance threshold below which a photo is considered blurry.
// Higher = stricter (fewer results); lower = more permissive (more results).
// Starting aggressive — only flags extremely blurry photos.
// TODO: calibrate based on real-library data.
export const BLUR_SCORE_THRESHOLD = 50

// Resolution requested from the Google Photos CDN for grid display.
// Large enough to assess blur quality without excessive bandwidth.
const DISPLAY_HEIGHT = 500

interface QualityResultsProps {
  totalItems: number
  mediaItems: Record<string, GpdMediaItem>
  blurScores: Record<string, number>
  selectedItemKeys: Set<string>
  onToggleItem: (mediaKey: string) => void
  onSelectAll: (flaggedKeys: string[]) => void
  onDeselectAll: () => void
  onTrash: () => void
  onRescan: () => void
}

export function QualityResults({
  totalItems,
  mediaItems,
  blurScores,
  selectedItemKeys,
  onToggleItem,
  onSelectAll,
  onDeselectAll,
  onTrash,
  onRescan,
}: QualityResultsProps) {
  const flaggedItems = useMemo(() => {
    return Object.entries(blurScores)
      .filter(([, score]) => score < BLUR_SCORE_THRESHOLD)
      .sort(([, a], [, b]) => a - b) // ascending: worst (most blurry) first
      .flatMap(([mediaKey, score]) => {
        const item = mediaItems[mediaKey]
        return item ? [{ mediaKey, score, item }] : []
      })
  }, [blurScores, mediaItems])

  const flaggedKeys = useMemo(
    () => flaggedItems.map((f) => f.mediaKey),
    [flaggedItems]
  )

  const selectedCount = flaggedKeys.filter((k) => selectedItemKeys.has(k)).length

  if (flaggedItems.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 8,
          gap: 2,
        }}>
        <Typography variant="h6" fontWeight={600}>
          No blurry photos found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Scanned {totalItems.toLocaleString()} photo
          {totalItems !== 1 ? "s" : ""} — none fell below the blur threshold.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<SearchRoundedIcon />}
          onClick={onRescan}>
          Back to Scan
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Action bar */}
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3,
          py: 1.5,
          mb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexWrap: "wrap",
        }}>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {flaggedItems.length.toLocaleString()} blurry photo
          {flaggedItems.length !== 1 ? "s" : ""} found
          {selectedCount > 0 ? ` · ${selectedCount.toLocaleString()} selected` : ""}
        </Typography>
        <Button size="small" onClick={() => onSelectAll(flaggedKeys)}>
          Select all
        </Button>
        <Button
          size="small"
          onClick={onDeselectAll}
          disabled={selectedCount === 0}>
          Deselect all
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<DeleteOutlineRoundedIcon />}
          disabled={selectedCount === 0}
          onClick={onTrash}>
          Trash {selectedCount > 0 ? selectedCount.toLocaleString() : ""}
        </Button>
        <Button size="small" variant="outlined" onClick={onRescan}>
          Back to Scan
        </Button>
      </Paper>

      {/* Photo grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 1.5,
          px: 3,
          pb: 4,
        }}>
        {flaggedItems.map(({ mediaKey, score, item }) => {
          const isSelected = selectedItemKeys.has(mediaKey)
          return (
            <Box
              key={mediaKey}
              onClick={() => onToggleItem(mediaKey)}
              sx={{
                position: "relative",
                cursor: "pointer",
                borderRadius: 1,
                overflow: "hidden",
                outline: isSelected ? "3px solid" : "none",
                outlineColor: "primary.main",
                "&:hover": { opacity: 0.92 },
              }}>
              <Box
                component="img"
                src={item.thumb + `=h${DISPLAY_HEIGHT}`}
                alt={item.fileName ?? "Photo"}
                sx={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "4/3",
                  objectFit: "cover",
                  bgcolor: "grey.100",
                }}
              />

              {/* Checkbox overlay */}
              <Checkbox
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onToggleItem(mediaKey)}
                sx={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  bgcolor: "rgba(255,255,255,0.75)",
                  borderRadius: 1,
                  p: 0.25,
                }}
              />

              {/* Blur score badge — useful for threshold calibration */}
              <Tooltip title="Laplacian variance (lower = blurrier)">
                <Chip
                  label={score.toFixed(1)}
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 6,
                    right: 6,
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "white",
                    fontSize: "0.7rem",
                    height: 20,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </Tooltip>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
