# Pedals & Effects - Technical Explainer

## Overview

Harmonica includes several classic guitar effects implemented as software "pedals." These effects process your audio signal in real-time, adding character, depth, and texture to your guitar sound.

Each effect can be enabled/disabled independently and has its own set of parameters. The effects are processed in a specific order in the signal chain.

---

## Drive Pedal (Distortion/Overdrive)

### What It Does
The Drive Pedal adds distortion to your signal by amplifying it beyond its normal range and then clipping (limiting) the waveform. This creates harmonics and sustain - the core of rock and metal guitar tones.

### How It Works (Technically)
The drive circuit uses **asymmetric soft clipping** to emulate tube amplifier behavior:

1. **Input Amplification**: Your signal is boosted by a "drive" factor (1x to 10x)
2. **Asymmetric Clipping**: Positive and negative halves of the waveform are clipped differently:
   - Positive peaks: Softer clipping (tanh with 0.7x factor)
   - Negative peaks: Harder clipping (tanh with 1.3x factor)
3. **Tone Filtering**: A lowpass filter shapes the brightness
4. **DC Blocking**: A high-pass filter at 20Hz removes DC offset from the asymmetric clipping
5. **Output Level**: Final volume adjustment

The asymmetric clipping is what gives the pedal its "tube-like" character. Real tube amps clip asymmetrically due to the physics of vacuum tubes.

### Parameters

**Drive (0-100%)**
Controls how much the signal is amplified before clipping.
- **0-20%**: Light crunch, barely breaking up
- **20-50%**: Classic rock overdrive
- **50-80%**: Heavy distortion
- **80-100%**: Extreme fuzz-like saturation

Internally, this maps to a gain factor of 1.0 to 10.0.

**Tone (0-100%)**
Controls the brightness of the distorted signal.
- **0%**: Dark, muffled (lowpass at 500Hz)
- **50%**: Balanced, mid-focused
- **100%**: Bright, cutting (lowpass at 8kHz)

This is implemented as a variable lowpass filter that sweeps from 500Hz to 8kHz.

**Level (dB)**
The output volume of the pedal. Allows you to match the volume with your bypassed signal or boost for solos.
- Negative values: Cut volume
- 0dB: Unity gain
- Positive values: Boost volume

**Enabled (On/Off)**
Bypasses the entire effect when off. When bypassed, no processing occurs.

### Use Cases
- **Light overdrive**: Low drive, high tone for clean-ish crunch
- **Classic rock**: Medium drive, balanced tone
- **High gain metal**: Maximum drive, tone to taste
- **Boost for solos**: Low drive, high level to push the amp

---

## Chorus

### What It Does
Chorus creates the illusion of multiple instruments playing the same part by splitting your signal into multiple copies and modulating their pitch slightly. The result is a shimmering, animated sound that adds width and depth.

### How It Works (Technically)
The chorus uses **modulated delay lines** to create the effect:

1. **Signal Splitting**: Your input is copied to three separate voices (per channel)
2. **Modulated Delay**: Each voice passes through a delay line whose time is continuously varied by an LFO (Low Frequency Oscillator)
3. **Phase Offset**: Each voice has a different LFO phase so they don't modulate in sync
4. **Linear Interpolation**: Smooth pitch variations are achieved by interpolating between delay samples
5. **Feedback**: A portion of the output is fed back to the input for richness
6. **Mixing**: The modulated voices are blended with the dry signal

When the delay time changes, the pitch changes (Doppler effect). This creates the characteristic "warble" of chorus.

### Parameters

**Rate (0.1-10 Hz)**
How fast the pitch modulation oscillates.
- **0.1-1 Hz**: Slow, dreamy modulation
- **1-3 Hz**: Classic chorus speed
- **3-10 Hz**: Fast, vibrato-like effect

**Depth (0-100%)**
How much the pitch varies during modulation.
- **0%**: No modulation (essentially a static short delay)
- **25%**: Subtle thickening
- **50%**: Standard chorus depth
- **100%**: Extreme, almost detuned sound

**Feedback (0-100%)**
How much of the output is recycled back to the input.
- **0%**: Clean, simple chorus
- **20%** (default): Adds some richness
- **50%+**: Can create flanging-like effects

**Mix (0-100%)**
Balance between dry and effected signal.
- **0%**: Dry signal only (no effect)
- **50%** (default): Equal blend
- **100%**: Only the chorused voices (sounds thin)

**Enabled (On/Off)**
Bypasses the effect when off.

### Use Cases
- **Clean guitar shimmer**: Low rate (0.5Hz), medium depth (30%), low mix (30%)
- **80s pop chorus**: Medium rate (2Hz), high depth (60%), high mix (50%)
- **Leslie speaker simulation**: High rate (5Hz+), medium depth
- **Subtle thickening**: Very low depth (10%), medium mix

---

## Delay

### What It Does
Delay creates echoes of your signal by recording it and playing it back after a specified time. Multiple repeats (echoes) are created through feedback, and the echoes can be filtered to sound more natural or to fit better in a mix.

### How It Works (Technically)
The delay uses **stereo delay lines with feedback and damping**:

1. **Delay Lines**: Separate delay buffers for left and right channels
2. **Linear Interpolation**: For smooth delay time changes and non-integer sample delays
3. **Feedback Loop**: Output is fed back to input, creating repeating echoes
4. **Damping Filter**: Each feedback iteration passes through a lowpass filter
5. **Ping-Pong Mode**: Feedback alternates between left and right channels
6. **Dry/Wet Mixing**: Original signal blended with delayed signal

The damping is crucial for natural-sounding delays. In the real world, high frequencies dissipate faster than low frequencies, so each echo should be progressively darker.

### Parameters

**Time (1-2000 ms)**
The delay time in milliseconds.
- **1-50ms**: Slapback/doubling effect
- **50-200ms**: Rhythmic echoes
- **200-500ms**: Standard delay
- **500-2000ms**: Long, ambient delays

**Feedback (0-100%)**
How much of the delayed signal feeds back to create more echoes.
- **0%**: Single echo only
- **30%** (default): 4-5 audible echoes
- **50%**: Many echoes, fading slowly
- **80%+**: Very long trails, near self-oscillation
- **100%**: Infinite repeats (dangerous - can build up)

**Damping (0-100%)**
How much high frequencies are removed from each echo.
- **0%**: Bright echoes (digital, pristine)
- **50%** (default): Natural-sounding decay
- **100%**: Very dark echoes (tape-like)

This is implemented as a lowpass filter in the feedback path.

**Ping-Pong (On/Off)**
When enabled, echoes alternate between left and right speakers.
- **Off**: Echoes stay in the same stereo position as the dry signal
- **On**: First echo goes to opposite side, second echo returns, etc.

Creates a wider, more spacious sound.

**Mix (0-100%)**
Balance between dry signal and delayed signal.
- **0%**: Dry only (no delay audible)
- **30%** (default): Delays audible but not overwhelming
- **50%**: Equal blend (very prominent delay)
- **100%**: Only the delayed signal (no direct sound)

**Enabled (On/Off)**
Bypasses the effect when off.

### Use Cases
- **Slapback**: 80-120ms, low feedback (10%), no damping
- **Rhythmic delay**: Tempo-synced time, 30-40% feedback
- **Ambient wash**: Long time (500ms+), high feedback (60%), high damping
- **Ping-pong widener**: Medium time, low feedback, ping-pong on

---

## Graphic EQ (9-Band)

### What It Does
The Graphic Equalizer allows you to boost or cut specific frequency ranges, shaping the overall tone of your sound. Harmonica has two graphic EQs: one before the amp (Pre-EQ) and one after (Post-EQ).

### How It Works (Technically)
The EQ uses **IIR peak/shelf filters** at fixed frequencies:

1. **Filter Design**: Each band uses a peaking EQ filter (bell curve response)
2. **Coefficient Calculation**: Filter coefficients are calculated based on center frequency, gain, and Q
3. **Per-Channel Processing**: Left and right channels filtered independently
4. **Cascaded Processing**: All 9 bands applied in series

Each band affects a specific frequency range without significantly affecting adjacent frequencies (though there is some overlap).

### Frequency Bands

| Band | Center Frequency | Character |
|------|------------------|-----------|
| 1    | 100 Hz           | Sub-bass, rumble |
| 2    | 200 Hz           | Bass, low thump |
| 3    | 400 Hz           | Low-mid warmth |
| 4    | 800 Hz           | Mid-range body |
| 5    | 1.6 kHz          | Upper-mid presence |
| 6    | 3.2 kHz          | High-mid bite |
| 7    | 6.4 kHz          | Treble clarity |
| 8    | 10 kHz           | High treble, air |
| 9    | 16 kHz           | Extreme highs, sparkle |

### Parameters

**Band Gain (dB)**
Each band can be boosted or cut by up to ±12dB (typical range).
- **Negative values**: Cut (reduce) that frequency range
- **0dB**: No change
- **Positive values**: Boost that frequency range

**Enabled (On/Off)**
Bypasses the entire EQ when off.

### Pre-EQ vs Post-EQ

**Pre-EQ** (before the amp):
- Shapes the signal going INTO the amp
- Changes how the amp/distortion responds
- Boosting mids here = more mid-focused distortion
- Cutting bass here = tighter low end

**Post-EQ** (after the amp):
- Shapes the signal coming OUT OF the amp
- Final tone sculpting
- Doesn't affect distortion character
- Better for surgical frequency correction

### Use Cases
- **Scooped metal**: Cut 400-800Hz, boost 100Hz and 3.2kHz
- **Mid-boost solo**: Boost 1.6kHz and 3.2kHz
- **Bass cut for clarity**: Cut 100-200Hz
- **Presence boost**: Boost 3.2-6.4kHz
- **Remove muddiness**: Cut 200-400Hz

---

## Common Architecture

All pedals share these characteristics:

### Thread Safety
Parameters use atomic variables so they can be safely updated from the UI thread while the audio thread is processing.

### Denormal Protection
Very small floating-point numbers (denormals) can cause CPU spikes. All effects include protection against this.

### Stereo Processing
All effects process left and right channels independently, maintaining stereo information.

### Prepare/Process Pattern
- `prepare(sampleRate, blockSize)`: Called when audio settings change
- `processBlock(buffer)`: Called repeatedly with audio to process

### Enable/Bypass
When disabled, effects pass audio through without modification, saving CPU.

---

## Signal Chain Order

The typical signal flow through effects is:

```
Guitar Input
    │
    ▼
[Pre-EQ]        ← Shape tone before amp
    │
    ▼
[Drive Pedal]   ← Add distortion
    │
    ▼
[Amp/NAM]       ← Main amp tone
    │
    ▼
[Post-EQ]       ← Final tone shaping
    │
    ▼
[Multivoicer]   ← Harmonies (if enabled)
    │
    ▼
[Chorus]        ← Modulation
    │
    ▼
[Delay]         ← Time-based effects
    │
    ▼
[Reverb]        ← Ambience (per-amp)
    │
    ▼
Output
```

The order matters! For example:
- Delay before distortion = fuzzy, indistinct echoes
- Delay after distortion = clean, defined echoes

---

## File References

| Effect | Files |
|--------|-------|
| Drive Pedal | `Source/DSP/Effects/DrivePedal.h`, `DrivePedal.cpp` |
| Chorus | `Source/DSP/Effects/Chorus.h`, `Chorus.cpp` |
| Delay | `Source/DSP/Effects/Delay.h`, `Delay.cpp` |
| Graphic EQ | `Source/DSP/Effects/GraphicEQ.h`, `GraphicEQ.cpp` |
| Parameter IDs | `Source/Parameters/ParameterIDs.h` |

---

## Parameter ID Reference

### Drive Pedal
- `drive_enabled` - On/off
- `drive_drive` - Distortion amount
- `drive_tone` - Brightness
- `drive_level` - Output volume

### Chorus
- `chorus_enabled` - On/off
- `chorus_rate` - Modulation speed (Hz)
- `chorus_depth` - Modulation intensity
- `chorus_feedback` - Feedback amount
- `chorus_mix` - Dry/wet balance

### Delay
- `delay_enabled` - On/off
- `delay_time` - Delay time (ms)
- `delay_feedback` - Echo repetitions
- `delay_damping` - High-frequency roll-off
- `delay_pingpong` - Stereo alternation
- `delay_mix` - Dry/wet balance

### Graphic EQ (Pre)
- `pre_eq_enabled` - On/off
- `pre_eq_band1` through `pre_eq_band9` - Band gains (dB)

### Graphic EQ (Post)
- `post_eq_enabled` - On/off
- `post_eq_band1` through `post_eq_band9` - Band gains (dB)
