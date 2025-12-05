# Harmonica Features Guide

A comprehensive guide to all features available in Harmonica, the guitar amp simulator and harmonizer plugin.

---

## Amplifiers

Harmonica includes **three distinct amplifier channels**, each with its own unique tonal character. Switch between amps instantly or dial in your perfect tone with the comprehensive controls available on each.

### Amp 1 — Modern High-Gain

Inspired by legendary high-gain amplifiers, Amp 1 delivers a scooped, powerful tone perfect for metal and modern rock. The default sound features boosted bass and treble with scooped mids for that thick, chunky attack.

### Amp 2 — Vintage Chime

A bright, jangly character inspired by British class-A amplifiers. Amp 2 excels at clean tones with sparkle and definition. The default voicing emphasizes treble and upper mids for that classic chimey sound beloved by indie and alternative players.

### Amp 3 — Classic Rock

The quintessential rock amplifier tone with a pronounced mid-range punch. Amp 3 captures that classic British crunch sound—perfect for blues, classic rock, and everything in between.

### Amp Controls (Available on Each Amp)

#### Input & Output
| Control | Range | Description |
|---------|-------|-------------|
| Input Gain | -12 to +12 dB | Adjusts signal level going into the amp |
| Output Gain | -12 to +12 dB | Controls the final output level of the amp |

#### Noise Gate
Built-in noise gate to eliminate unwanted hum and buzz during silent passages.

| Control | Range | Description |
|---------|-------|-------------|
| Gate Enabled | On/Off | Toggle the noise gate |
| Threshold | -80 to 0 dB | Signal level below which the gate closes |
| Attack | 0.1 to 100 ms | How quickly the gate opens when signal is detected |
| Release | 10 to 1000 ms | How slowly the gate closes after signal stops |
| Hold | 0 to 500 ms | Minimum time gate stays open after triggering |

#### Tone Stack (3-Band EQ)
| Control | Range | Description |
|---------|-------|-------------|
| Bass | -12 to +12 dB | Low frequency content |
| Mid | -12 to +12 dB | Mid-range frequencies |
| Treble | -12 to +12 dB | High frequency content |

#### Cabinet Simulation
Authentic speaker cabinet emulation using impulse responses.

| Control | Range | Description |
|---------|-------|-------------|
| Cabinet Enabled | On/Off | Toggle cabinet simulation |
| Cabinet Mix | 0 to 100% | Blend between direct amp sound and cabinet-processed signal |

#### Presence
| Control | Range | Description |
|---------|-------|-------------|
| Presence | -12 to +12 dB | High-frequency "air" and sparkle above the treble control |

#### Reverb
Lush built-in reverb to add space and dimension to your tone.

| Control | Range | Description |
|---------|-------|-------------|
| Reverb Enabled | On/Off | Toggle reverb effect |
| Size | 0 to 100% | Room size from intimate booth to expansive cathedral |
| Damping | 0 to 100% | High-frequency absorption for darker reverb tails |
| Width | 0 to 100% | Stereo spread of the reverb |
| Mix | 0 to 100% | Dry/wet blend of the reverb effect |

#### Compressor
Smooth dynamics control for consistent levels and sustain.

| Control | Range | Description |
|---------|-------|-------------|
| Compressor Enabled | On/Off | Toggle compression |
| Threshold | -60 to 0 dB | Level above which compression begins |
| Ratio | 1:1 to 20:1 | Amount of gain reduction applied |
| Attack | 0.1 to 100 ms | How quickly compression engages |
| Release | 10 to 1000 ms | How slowly compression releases |
| Makeup Gain | 0 to 24 dB | Compensate for volume lost during compression |
| Mix | 0 to 100% | Parallel compression blend for punch with dynamics |

---

## Multivoicer / Harmonizer

The heart of Harmonica—a sophisticated **4-voice pitch shifter and harmonizer** that can create anything from subtle doubling effects to full vocal-style harmonies and otherworldly synth textures.

### Operating Modes

#### Harmonizer Mode
Traditional pitch-shifting with up to 4 independent voices. Create harmonies, octaves, detune effects, and more.

#### Vocoder Mode
A 16-band vocoder for synth-like, robotic, and alien voice effects. Transform your guitar into a talking synthesizer.

### Master Controls

| Control | Range | Description |
|---------|-------|-------------|
| Multivoicer Enabled | On/Off | Toggle the entire multivoicer section |
| Mode | Harmonizer / Vocoder | Switch between operating modes |
| Dry/Wet Mix | 0 to 100% | Balance between original signal and harmonized voices |

### Voice Voicing Presets

Quick-access presets for common harmony arrangements:

| Voicing | Description |
|---------|-------------|
| Closed Voicing | Voices arranged close together for tight harmonies |
| Open Voicing | Voices spread apart for bigger, more open sound |
| Stacked Octaves | Layered octave harmonies for massive sound |
| Custom | Manual control of all voice parameters |

### Global Voice Effects

| Control | Range | Description |
|---------|-------|-------------|
| Glissando | 0 to 1000 ms | Smooth pitch glide time when changing intervals |
| Unison | 0 to 100% | Subtle detuning spread for chorus-like thickness |
| Width | 0 to 200% | Stereo field expansion (100% = normal) |
| Tone | 0 to 100% | Overall brightness of the harmonized voices |

### Scale Quantization

Lock your harmonies to musical scales for always-in-key results.

| Control | Options |
|---------|---------|
| Quantize Enabled | On/Off |
| Scale Type | Chromatic, Major, Minor, Harmonic Minor, Pentatonic Major, Pentatonic Minor, Dorian, Mixolydian |
| Root Key | C, C#, D, D#, E, F, F#, G, G#, A, A#, B |

### Voice Controls (4 Voices)

Each of the 4 voices can be individually configured:

| Control | Range | Description |
|---------|-------|-------------|
| Voice Enabled | On/Off | Toggle individual voice |
| Interval | -12 to +12 semitones | Pitch shift amount (0 = unison, 12 = octave up, -12 = octave down) |
| Mix | 0 to 100% | Individual voice volume |
| Pan | Left to Right | Stereo position of the voice |
| Detune | -100 to +100 cents | Fine-tuning for thickness or correction |
| Delay | 0 to 500 ms | Per-voice delay for slapback and doubling effects |

#### Default Voice Configuration
- **Voice 1**: +5 semitones (perfect fifth up)
- **Voice 2**: -5 semitones (perfect fifth down)
- **Voice 3**: +12 semitones (octave up)
- **Voice 4**: Disabled by default (available for custom harmonies)

### Vocoder Controls

When in Vocoder Mode, additional controls become available:

| Control | Range | Description |
|---------|-------|-------------|
| Vocoder Mix | 0 to 100% | Blend of vocoded signal |
| Formant Shift | -12 to +12 semitones | Shift vocal formants for gender-bending effects |
| Synth Mix | 0 to 100% | Internal synthesizer carrier blend |

### MIDI Harmonizer Mode

| Control | Description |
|---------|-------------|
| MIDI Mode | When enabled, voice intervals follow incoming MIDI notes for real-time chord-following harmonies |

---

## Effects Pedals

### Drive Pedal

Warm, tube-style overdrive for everything from subtle grit to saturated crunch.

| Control | Range | Description |
|---------|-------|-------------|
| Drive Enabled | On/Off | Toggle the drive effect |
| Drive Amount | 0 to 100% | Intensity of the distortion |
| Tone | 0 to 100% | Brightness of the overdrive (dark to bright) |
| Level | -12 to +12 dB | Output volume compensation |

### Chorus

Rich modulation effect with 3 voices for lush, detuned sounds.

| Control | Range | Description |
|---------|-------|-------------|
| Chorus Enabled | On/Off | Toggle chorus effect |
| Rate | 0.1 to 10 Hz | Speed of the modulation |
| Depth | 0 to 100% | Intensity of the pitch modulation |
| Feedback | 0 to 95% | Amount of signal fed back for more intense effect |
| Mix | 0 to 100% | Dry/wet blend |

### Delay

Versatile delay effect with optional ping-pong stereo mode.

| Control | Range | Description |
|---------|-------|-------------|
| Delay Enabled | On/Off | Toggle delay effect |
| Time | 1 to 2000 ms | Delay time between repeats |
| Feedback | 0 to 95% | Number of repeats (higher = more echoes) |
| Damping | 0 to 100% | High-frequency absorption on repeats |
| Ping-Pong | On/Off | Stereo bouncing effect |
| Mix | 0 to 100% | Dry/wet blend |

---

## Equalizers

### Pre-Amp EQ (9-Band Graphic)

Shape your tone before it hits the amp for precise tonal sculpting.

| Band | Frequency |
|------|-----------|
| 1 | 100 Hz |
| 2 | 200 Hz |
| 3 | 400 Hz |
| 4 | 800 Hz |
| 5 | 1.6 kHz |
| 6 | 3.2 kHz |
| 7 | 6.4 kHz |
| 8 | 10 kHz |
| 9 | 16 kHz |

Each band: **-12 to +12 dB** adjustment

### Post-Amp EQ (9-Band Graphic)

Fine-tune your final sound after the amp processing. Same 9 bands as the Pre-Amp EQ with identical ranges.

---

## Global Controls

### Master Section

| Control | Range | Description |
|---------|-------|-------------|
| Global Input Gain | -12 to +12 dB | Master input level |
| Global Output Gain | -12 to +12 dB | Master output level |
| Global Bypass | On/Off | Bypass all processing |
| Input Enabled | On/Off | Master input mute |

### Active Amp Selection

Instantly switch between Amp 1, Amp 2, and Amp 3.

### Audio Quality

| Control | Options | Description |
|---------|---------|-------------|
| Oversampling | Off, 2x, 4x, 8x | Higher values = better quality, more CPU |
| CPU Saver Mode | On/Off | Reduce processing load for lower-powered systems |

### Interface Settings

| Control | Options | Description |
|---------|---------|-------------|
| Show Tooltips | On/Off | Display helpful hover information |
| Show Meter Values | On/Off | Display numerical readouts on meters |
| UI Scale | 100% to 125% | Interface size adjustment |

---

## Signal Flow

Understanding how your signal travels through Harmonica:

```
Guitar Input
    │
    ▼
Global Input Gain
    │
    ▼
Pre-Amp EQ (9-band)
    │
    ▼
Drive Pedal
    │
    ▼
┌─────────────────────────────────────┐
│          ACTIVE AMP CHANNEL         │
│  Compressor → Gate → Tone Stack →   │
│  Amp Modeling → Cabinet → Presence  │
│              → Reverb               │
└─────────────────────────────────────┘
    │
    ▼
Post-Amp EQ (9-band)
    │
    ▼
Chorus
    │
    ▼
Delay
    │
    ▼
Multivoicer (Harmonizer/Vocoder)
    │
    ▼
Global Output Gain
    │
    ▼
Output
```

---

## Use Case Examples

### Classic Clean Tones
- Select **Amp 2** for chimey cleans
- Add subtle **Chorus** for shimmer
- Use **Reverb** for space
- Light **Compression** for consistency

### High-Gain Metal
- Select **Amp 1** for modern aggression
- Engage **Drive Pedal** for extra saturation
- Use **Noise Gate** to keep things tight
- Shape with **Pre-Amp EQ** for surgical precision

### Harmony Leads
- Enable **Multivoicer** in Harmonizer mode
- Set **Voice 1** to +4 semitones (major third)
- Set **Voice 2** to +7 semitones (perfect fifth)
- Enable **Scale Quantization** for always-in-key harmonies

### Octave Effects
- Enable **Multivoicer**
- Select **Stacked Octaves** voicing preset
- Adjust **Dry/Wet Mix** to taste
- Add **Delay** for epic soundscapes

### Synth/Experimental
- Enable **Multivoicer** in **Vocoder Mode**
- Adjust **Formant Shift** for alien textures
- Increase **Synth Mix** for robotic sounds
- Use **Chorus** and **Delay** for extra dimension

### MIDI-Controlled Harmonies
- Enable **MIDI Mode** in Multivoicer
- Connect a MIDI controller or DAW track
- Play chords via MIDI while your guitar provides the tone
- Harmonies follow your MIDI input in real-time

---

## Summary

| Category | Features |
|----------|----------|
| Amplifiers | 3 distinct amp characters with full tone stack, cabinet simulation, reverb, compressor, and noise gate |
| Multivoicer | 4-voice pitch shifter, 8 scale types, 4 voicing presets, vocoder mode, MIDI control |
| Effects | Drive pedal, Chorus, Delay with ping-pong |
| Equalizers | Dual 9-band graphic EQ (pre and post amp) |
| Quality | Adjustable oversampling up to 8x, CPU saver mode |
