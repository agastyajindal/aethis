# Aethis v0.5.0-Beta — Release Notes

*April 2026 — from v0.4.1-Alpha*

---

## New Tab: Cabinet

A dedicated Cabinet tab with a full dual-cab mixing environment.

- **Dual Cabinet System** — Run two independent cabinets simultaneously, each with its own IR, level, and panning
- **Mic Position Visualizer** — Drag the mic dot across the speaker cone to blend center (bright) to edge (warm)
  - 6 mic types to choose from: SM57, MD421, R121, e609, U47, M160
- **Per-Cab Controls** — Level, Pan, Distance, and Phase Invert for each cabinet
- **Simple / Complex Mode** — Simple mode for quick tone shaping; Complex mode reveals the full mic grid and per-cab parameters
- **Stereo Cab Panning** — Pan each cabinet left/right independently for wide stereo tones
- The old IR toggle has been removed from the header and moved into this tab

---

## New Tab: Bloom

An entirely new effects tab with three pitch-aware processors and a sakura blossom visual theme.

### Contour — Pitch-Aware Dynamic EQ
- Adapts a 3-band EQ based on your playing register (low / mid / high notes)
- **Contour** knob controls overall intensity
- **Body** knob tightens or loosens the low end depending on what you're playing
- **Air** knob adds presence and shimmer to upper harmonics

### OCT — Polyphonic Octaver
- -1 OCT and -2 OCT with independent level controls
- **Tone** knob darkens or brightens the octave signal
- Low-latency pitch tracking

### Bitcrush — Tuned Aliasing
- Pitch-locked sample rate reduction for musical aliasing that tracks your notes
- **Crush** controls the decimation amount
- **Bits** reduces bit depth from 16-bit (clean) down to 2-bit (extreme lo-fi)
- **Filter** shapes the post-crush tone
- **Mix** blends crushed signal with dry

---

## Redesigned: Parametric EQ

The EQ tab has been upgraded from a fixed 9-band graphic EQ to a fully interactive parametric EQ.

- **9 Draggable Bands** — Click and drag any band to set its frequency and gain
- **High-Pass and Low-Pass Filters** — Steep 24 dB/oct rolloff with adjustable cutoff
- **Output Gain** knob
- **Real-Time Spectrum Analyzer** overlaid on the EQ curve
- **Pre/Post Toggle** — Place the EQ before or after the amp
- Smoother knob response — no more clicks when sweeping bands quickly

---

## Redesigned: Drive Pedal

The drive pedal has been completely rewritten.

- **Warm Tube Character** — Two-stage saturation that generates natural even harmonics for a warm, organic overdrive tone
- **Full Drive Range** — Clean boost at 0%, clear crunch at 50%, heavy saturated overdrive at 100%. The old version barely distorted at moderate settings — this one actually works across the full range.
- **Improved Tone Control** — Sweeps from dark to bright with a wider usable range
- **Better Output Level** — Level knob now goes up to +6 dB (previously capped at 0 dB)

---

## New: Splash Screen

A branded video intro plays on launch while the app loads in the background.

- Audio is muted during the splash and unmutes automatically when loading completes
- Loading is now significantly faster — the active amp model loads instantly, and remaining resources load in the background during the splash

---

## New: Custom Font — Firmament

All headers and titles across the app now use **Firmament**, a custom-designed display font with an Avengers-inspired "A" and consistent stroke weight. Replaces the previous font used in v0.4.1.

---

## New: Update Checker

Aethis now checks for updates on launch and shows a non-intrusive notification when a new version is available.

---

## New: Rack-Style Pedal UI

The Pre-FX and Post-FX panels have been redesigned with a rack strip aesthetic. Pedal cards and knob filmstrips match the selected amp's color theme.

---

## New: Window Size — 16:10

The window has been changed from 16:9 to 16:10 for more vertical space. Resizable from 1280x800 up to 1920x1200.

---

## Improvements

- **Faster Startup** — Only the active amp model loads before audio starts; everything else loads in the background
- **Universal Binary** — Now includes both Apple Silicon and Intel support in a single download
- **Reverb** — New Room Size control
- **Delay & Reverb Mix Knob** — Guitar pedal taper: 0–50% adds wet over dry at full volume; 50–100% fades dry out for ambient / kill-dry use
- **Noise Gate** — Added Mix (dry/wet) and Band Mode (Lo / Band / High) controls for frequency-focused gating
- **Post-Install Guide** — A setup guide automatically opens after installation on both macOS and Windows

---

## Bug Fixes

- Drive pedal now actually distorts and clips at moderate and high settings
- Bloom Contour knobs now respond immediately when turned (previously had no effect until a register change)
- Bloom Bitcrush at minimum crush no longer degrades the signal — fully transparent at 0%
- Bloom OCT no longer clips when both octave voices are at maximum level
- Bloom OCT tone at minimum no longer kills the octave signal
- EQ no longer clicks when sweeping band frequencies or gain quickly
- Splash screen no longer gets stuck or blocks the app from loading
- AU plugin now correctly responds to host-initiated window resize in Logic Pro and GarageBand
- Windows standalone window no longer starts at an incorrect size
- No more audio crackling during silent passages
- Fixed mono/stereo input switching causing a brief audio glitch — now crossfades smoothly
- Fixed a crash when closing the plugin window in VST3 and AU hosts

---

## System Requirements

- **macOS**: 12.0 Monterey or later (Apple Silicon + Intel)
- **Windows**: 10 (version 1809) or later, 64-bit
- **Formats**: Standalone App, VST3, Audio Unit (macOS only)
