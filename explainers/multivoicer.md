# Multivoicer - Technical Explainer

## What Is the Multivoicer?

The Multivoicer is Harmonica's pitch-shifting harmonizer. It takes your guitar signal and creates up to four additional "voices" at different pitches, allowing you to play harmonies in real-time without another guitarist. Think of it as having a choir of guitars that follows everything you play.

The effect can produce anything from subtle thickening (two guitars playing the same note with slight detuning) to full chord voicings (four distinct harmony notes stacked on top of your original signal).

---

## Operating Modes

### Harmonizer Mode (Default)
This is the traditional pitch-shifting mode. Your guitar signal is processed through the Signalsmith Stretch algorithm, which shifts the pitch while preserving the natural timbre of your instrument. The result sounds like actual guitars playing at different pitches.

### Vocoder Mode
This mode creates a more synthetic, robotic sound. Instead of pitch-shifting your guitar, it uses your guitar's dynamics (how hard you play, the attack of each note) to shape a synthesizer. The result is that classic "talking guitar" or "robot voice" effect you hear in electronic music.

---

## Voice Parameters

Each of the four voices has its own set of controls:

### Enabled (On/Off)
Simply turns the voice on or off. Voice 1 is enabled by default at 0 semitones (unison with your dry signal).

### Interval (Semitones)
This is the main pitch control. It sets how many semitones above or below your original note this voice will play.

- **0 semitones**: Same pitch as your guitar (unison)
- **+7 semitones**: Perfect fifth above (power chord interval)
- **+12 semitones**: One octave above
- **-12 semitones**: One octave below
- **+5 semitones**: Perfect fourth above

Common harmony intervals:
- Major third: +4 semitones
- Minor third: +3 semitones
- Perfect fifth: +7 semitones
- Octave: +12 or -12 semitones

### Mix (Level)
Controls how loud this particular voice is in the final mix. At 0%, the voice is silent. At 100%, it's at full volume. Use this to balance the prominence of each harmony.

### Pan (Stereo Position)
Places the voice in the stereo field:
- **-1.0**: Hard left
- **0.0**: Center
- **+1.0**: Hard right

Spreading voices across the stereo field creates width and separation. A common technique is to pan higher harmonies to one side and lower ones to the other.

### Detune (Cents)
Adds a subtle pitch offset in cents (1/100th of a semitone). This creates the "chorus-like" thickening effect. When multiple voices are slightly detuned from each other, they create a shimmering, animated quality.

- **Range**: -100 to +100 cents
- **Typical use**: ±10-30 cents for subtle thickening

### Delay (Milliseconds)
Adds a timing offset before this voice sounds. This can create:
- **0-10ms**: Subtle "double-tracking" effect
- **10-50ms**: Slapback/haas effect for width
- **50-100ms**: Rhythmic interest

---

## Global Parameters

These affect all voices simultaneously:

### Dry/Wet Mix
The balance between your original guitar signal (dry) and the harmonized voices (wet).
- **0%**: Only your original guitar
- **50%**: Equal blend
- **100%**: Only the harmonized voices

The mix uses an "equal-power" crossfade, meaning the perceived volume stays consistent across the entire range. At 50%, you won't hear a volume dip.

### Synth Mix
Blends a synthesizer layer with the pitch-shifted voices:
- **0%**: Pure pitch-shifted guitar (cleanest, most natural)
- **15%** (default): Subtle synth layer adds richness
- **100%**: Full synth layer (more electronic character)

The synth uses a band-limited sawtooth oscillator with anti-aliasing to prevent digital artifacts.

### Glissando
Controls how quickly pitch transitions happen when you change intervals (via MIDI or automation):
- **0ms**: Instant pitch jumps
- **100-500ms**: Smooth slides between notes
- **1000ms**: Very slow, dramatic pitch bends

This is particularly useful for MIDI-controlled harmonies where you're changing chords.

### Unison
Adds automatic detuning spread across all voices:
- **0%**: No automatic detuning
- **50%**: Moderate shimmer
- **100%**: Maximum spread (±30 cents)

Each voice gets a unique detuning pattern so they don't wobble in sync (which would sound unnatural).

### Width
Scales the pan positions of all voices:
- **0.0**: All voices collapsed to center (mono)
- **1.0**: Normal panning
- **2.0**: Exaggerated stereo spread

### Tone
A brightness control applied to all voices:
- **0.0**: Dark tone (-6dB high frequencies)
- **0.5**: Neutral (flat response)
- **1.0**: Bright tone (+6dB high frequencies)

This is a high-shelf filter centered at 3kHz.

---

## Scale Quantization

When enabled, the harmonizer will "snap" intervals to notes within a musical scale.

### How It Works
If you set a voice to +4 semitones (major third) but you're playing a note where a major third would be outside the selected scale, the harmonizer will adjust to the nearest scale tone. This prevents "wrong" notes in your harmonies.

### Scale Types
- **Chromatic**: All 12 notes allowed (no quantization)
- **Major**: Natural major scale
- **Minor**: Natural minor scale
- **Harmonic Minor**: Minor with raised 7th
- **Pentatonic Major**: 5-note major scale
- **Pentatonic Minor**: 5-note minor scale (blues-friendly)
- **Dorian**: Minor with raised 6th
- **Mixolydian**: Major with lowered 7th

### Key Selection
Sets the root note of the scale (C through B). This determines which notes are "in" the scale.

---

## Vocoder-Specific Parameters

These only apply in Vocoder mode or when the vocoder effect is enabled in Harmonizer mode:

### Vocoder Enabled
Activates the vocoder effect. In Harmonizer mode, this adds a vocoder layer on top of the pitch-shifted voices. In Vocoder mode, the vocoder is always active.

### Vocoder Mix
Blends between the normal output and the vocoded signal:
- **0%**: No vocoder effect
- **100%**: Full vocoder effect

### Formant Shift
Shifts the vocal formants (the resonant frequencies that give sounds their character):
- **-12 semitones**: Deep, monster-like
- **0 semitones**: Natural
- **+12 semitones**: Chipmunk-like

### Carrier Mix
Controls how much synthesizer is added to the vocoder's carrier signal. Higher values create a more synthetic, robotic sound.

---

## Signal Flow

Here's what happens to your guitar signal, step by step:

```
Guitar Input
    │
    ├─────────────────────────────────────┐
    │                                     │
    ▼                                     ▼
[Dry Signal Path]                    [Wet Signal Path]
    │                                     │
    │                              ┌──────┴──────┐
    │                              │ Voice 1     │
    │                              │ Voice 2     │
    │                              │ Voice 3     │
    │                              │ Voice 4     │
    │                              └──────┬──────┘
    │                                     │
    │                              [Equal-Power Mix]
    │                                     │
    │                              [Soft Limiter]
    │                                     │
    │                              [DC Blocker]
    │                                     │
[Latency Delay]                           │
(~100ms to match                          │
pitch shifter)                            │
    │                                     │
    └─────────────────┬───────────────────┘
                      │
              [Dry/Wet Crossfade]
                      │
              [Final Output]
```

### Why the Latency Delay?
Pitch shifting takes time. The Signalsmith Stretch algorithm introduces about 100-120ms of latency. If we mixed the dry signal directly with the wet signal, they would be out of sync, causing a "slapback" echo effect. By delaying the dry signal to match, everything stays aligned.

---

## Processing Details

### Voice Gain Staging
When multiple voices are active, their combined volume could easily clip (exceed 0dB). The multivoicer uses "equal-power" gain reduction:

```
voiceGain = headroom / sqrt(activeVoices)
```

With 4 voices active, each voice is reduced to about 42% of its original level. This maintains consistent overall loudness regardless of how many voices are enabled.

### Soft Limiting
To prevent harsh digital clipping when signals get too loud, the multivoicer uses a tanh-based soft limiter:

- **Below 0.9**: Signal passes through unchanged
- **Above 0.9**: Signal is smoothly compressed toward 0.98

This is much gentler than hard clipping, which would create harsh, unpleasant distortion.

### DC Offset Removal
When summing multiple voices, tiny DC offsets can accumulate. These inaudible low-frequency biases waste headroom and can cause speaker cone drift. A DC blocker (high-pass filter at 7Hz) removes these.

### 0-Semitone Bypass
When a voice is set to exactly 0 semitones (no pitch shift), it's tempting to still process it through the pitch shifter. But this causes problems: the pitch shifter subtly changes the phase, and when this phase-modified signal is mixed with the latency-compensated dry signal, you get comb filtering (certain frequencies cancel out).

Solution: If a voice is within 0.05 semitones of unity pitch, bypass the pitch shifter entirely and just pass the audio through.

---

## MIDI Control

The multivoicer can receive MIDI input to control harmony intervals in real-time. When MIDI is connected:

1. Play a chord on your MIDI controller
2. The multivoicer analyzes which notes are in the chord
3. Voice intervals are automatically set to match those notes
4. Your guitar plays the root, the voices play the harmony

This allows for dynamic chord changes during a performance.

---

## Common Presets/Use Cases

### Power Chord Thickener
- Voice 1: 0 semitones, center pan
- Voice 2: +7 semitones (fifth), slight right pan
- Dry/Wet: 50%
- Unison: 20%

### Octave Up + Fifth
- Voice 1: +12 semitones (octave up), slight right
- Voice 2: +7 semitones (fifth), slight left
- Dry/Wet: 40%

### Detuned Chorus
- Voice 1: +10 cents detune, left
- Voice 2: -10 cents detune, right
- Voice 3: +25 cents detune, center
- Dry/Wet: 30%

### Full Chord Stack
- Voice 1: +4 semitones (major third)
- Voice 2: +7 semitones (fifth)
- Voice 3: +12 semitones (octave)
- Voice 4: +16 semitones (octave + third)
- Scale Quantization: ON
- Dry/Wet: 60%

---

## Troubleshooting

### "Metallic" or "Robotic" Sound
- Lower the Synth Mix toward 0%
- Ensure Tone is set to 0.5 (neutral)
- Check that vocoder is disabled

### Audio Cuts Out or Stutters
- Increase buffer size in audio settings
- Disable unused voices
- Check CPU usage

### Harmonies Sound "Wrong"
- Enable Scale Quantization
- Set the correct Key for your song
- Choose the appropriate Scale type

### "Flanging" or Phasing Sound
- This can happen when a voice is at very small intervals (< 1 semitone)
- Try increasing the interval or disabling that voice

---

## Performance Tips

1. **Start with one voice** and add more gradually
2. **Use subtle pan separation** - extreme panning can sound unnatural
3. **Keep detune values small** (10-30 cents) for natural thickening
4. **Match the scale and key** to your song when using quantization
5. **Use the Glissando parameter** for smooth chord changes with MIDI
6. **Lower buffer size** for tighter latency (at the cost of CPU)

---

## File References

- **Header**: `Source/DSP/Multivoicer.h`
- **Implementation**: `Source/DSP/Multivoicer.cpp`
- **Voice (single pitch shifter)**: `Source/DSP/Voice.h`, `Source/DSP/Voice.cpp`
- **Pitch Shifter Wrapper**: `Source/DSP/SignalsmithPitchShifter.h`
- **Vocoder**: `Source/DSP/Vocoder.h`, `Source/DSP/Vocoder.cpp`
- **Parameter IDs**: `Source/Parameters/ParameterIDs.h` (prefixed with `mv_`)
