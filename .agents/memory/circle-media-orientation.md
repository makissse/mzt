---
name: Circle media orientation
description: Camera preview, canvas recording, and circle playback must share one orientation convention.
---

Front-camera circles should be mirrored in the recording canvas exactly as they appear in the live preview. Circle playback must render the saved media without another horizontal transform, otherwise the published result is double-inverted.

**Why:** Applying mirroring both while recording and while playing made published circles appear reversed relative to the recording interface.

**How to apply:** When changing circle recording or playback, treat the canvas output as the source of truth and keep the circle player orientation-neutral.