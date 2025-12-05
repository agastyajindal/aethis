# NAM & JUCE Integration - Technical Explainer

## What Is NAM?

NAM (Neural Amp Modeler) is a machine learning-based technology that captures the sound of real guitar amplifiers and effects. Instead of traditional algorithms that approximate amp behavior, NAM uses neural networks trained on actual hardware to reproduce its exact tonal character.

Harmonica integrates NAM to provide authentic amp tones that would otherwise require expensive gear and careful mic placement.

---

## How NAM Works (Conceptually)

### Training Process (Done Beforehand)
1. A guitarist plays test signals through a real amplifier
2. Both the input (dry guitar) and output (amped signal) are recorded
3. A neural network is trained to learn the relationship between input and output
4. The trained model is saved as a `.nam` file

### Runtime Process (In Harmonica)
1. Your guitar signal enters Harmonica
2. The signal is fed into the trained neural network
3. The network outputs what the real amp would have produced
4. This processed signal continues down the signal chain

The result is a captured amp tone that responds to your playing dynamics, picks up on your attack, and behaves like the original hardware.

---

## NAM Architecture Types

NAM supports several neural network architectures. Harmonica force-links all of them to avoid static initialization issues:

### WaveNet
- Deep convolutional network with dilated convolutions
- Excellent quality, captures complex nonlinearities
- Higher CPU usage
- Best for high-gain and complex amp behavior

### LSTM (Long Short-Term Memory)
- Recurrent neural network
- Good at capturing time-dependent behavior
- Moderate CPU usage
- Works well for amps with strong compression characteristics

### ConvNet (Convolutional Network)
- Standard convolutional architecture
- Lower CPU usage
- Good balance of quality and efficiency
- Suitable for cleaner amp tones

---

## NAM in Harmonica's Codebase

### Key Files
- `Source/DSP/NAMProcessor.h` - Header with class definition
- `Source/DSP/NAMProcessor.cpp` - Implementation

### Main Class: NAMProcessor

```cpp
class NAMProcessor {
    // Model loading
    bool loadModel(const juce::File& namFile);

    // Audio processing
    void process(juce::AudioBuffer<float>& buffer);

    // Initialization
    void prepare(double sampleRate, int maxBlockSize);
    void reset();

    // State queries
    bool isModelLoaded() const;
    double getExpectedSampleRate() const;
};
```

---

## Model Loading

### The Loading Process

```cpp
bool NAMProcessor::loadModel(const juce::File& namFile)
{
    // 1. Get file path
    std::string modelPath = namFile.getFullPathName().toStdString();

    // 2. Use NAM's factory function to create model
    model = nam::get_dsp(modelPath);

    // 3. Validate the model loaded successfully
    if (model == nullptr) return false;

    // 4. Mark as loaded (atomic for thread safety)
    modelLoaded.store(true);

    return true;
}
```

### Important: Load on Background Thread

Model loading involves file I/O and neural network initialization, which can take 100ms or more. **Never call loadModel() on the audio thread** - it will cause audio dropouts.

```cpp
// Correct: Load on background thread
juce::Thread::launch([this, file]() {
    namProcessor.loadModel(file);
});

// Wrong: Blocks audio thread!
namProcessor.loadModel(file);  // Don't do this in processBlock()!
```

---

## Audio Processing

### The Processing Loop

```cpp
void NAMProcessor::process(juce::AudioBuffer<float>& buffer)
{
    // 1. Safety check
    if (!modelLoaded.load()) return;

    // 2. Convert stereo to mono (sum and divide by 2)
    // NAM models are mono - they expect a single channel
    float* monoData = createMonoMix(buffer);

    // 3. Check for silence (optimization)
    if (isSilent(monoData, numSamples)) {
        // Skip processing during silence
        handleSilence();
        return;
    }

    // 4. Process through the neural network
    if (needsResampling) {
        processWithResampling(monoData, numSamples);
    } else {
        model->process(monoData, outputBuffer, numSamples);
    }

    // 5. Copy mono result back to both stereo channels
    copyMonoToStereo(buffer, outputBuffer);
}
```

### Why Mono Processing?

NAM models are trained on mono signals (one microphone on one amp). Processing stereo would:
1. Double CPU usage (processing twice)
2. Create phase issues (two instances of the same nonlinear model)
3. Waste resources for no benefit

The solution: Sum to mono, process once, copy to both channels.

---

## Sample Rate Handling

### The Problem
NAM models are trained at a specific sample rate (typically 48kHz). If your DAW runs at a different rate (44.1kHz, 96kHz, etc.), the model won't produce correct results.

### The Solution: Resampling

```cpp
void NAMProcessor::prepare(double sampleRate, int maxBlockSize)
{
    // Get the sample rate the model expects
    double modelRate = model->getExpectedSampleRate();

    // Calculate ratio
    resampleRatio = sampleRate / modelRate;

    // If rates differ by more than 1%, we need to resample
    needsResampling = std::abs(resampleRatio - 1.0) > 0.01;

    if (needsResampling) {
        // Allocate resampling buffers
        // Use Lagrange interpolation for high quality
        setupResampler(sampleRate, modelRate);
    }
}
```

### Resampling Flow

```
DAW Sample Rate (e.g., 44.1kHz)
           │
           ▼
    [Upsample to 48kHz]    ← Lagrange interpolation
           │
           ▼
    [NAM Processing]        ← Model runs at expected rate
           │
           ▼
    [Downsample to 44.1kHz] ← Lagrange interpolation
           │
           ▼
    Output
```

---

## Silence Detection

### Why Detect Silence?
Neural network processing is expensive. When there's no guitar signal (between songs, during breaks), we can skip processing entirely.

### The Algorithm

```cpp
bool NAMProcessor::isSilent(const float* data, int numSamples)
{
    // Calculate RMS level
    float rms = 0.0f;
    for (int i = 0; i < numSamples; i++) {
        rms += data[i] * data[i];
    }
    rms = std::sqrt(rms / numSamples);

    // Check against threshold (-80dB = 0.0001)
    return rms < 0.0001f;
}
```

### Debouncing
To prevent rapid on/off switching at the end of notes:

```cpp
// Don't instantly switch to silence mode
if (isSilent(data, numSamples)) {
    silenceCounter++;
    if (silenceCounter > GRACE_PERIOD) {  // ~250ms
        // Now we're confident it's actual silence
        enterSilenceMode();
    }
} else {
    silenceCounter = 0;
    exitSilenceMode();
}
```

---

## JUCE Integration

### JUCE's Role
JUCE (Jules' Utility Class Extensions) is the audio application framework Harmonica is built on. It provides:

- Audio I/O abstraction (works with any audio interface)
- Buffer management
- Plugin format support (VST3, AU, Standalone)
- GUI framework

### NAM Within JUCE's Audio Model

```cpp
class HarmonicaProcessor : public juce::AudioProcessor {
    NAMProcessor namProcessor;

    void prepareToPlay(double sampleRate, int samplesPerBlock) override {
        // Called when audio settings change
        namProcessor.prepare(sampleRate, samplesPerBlock);
    }

    void processBlock(juce::AudioBuffer<float>& buffer,
                      juce::MidiBuffer& midi) override {
        // Called ~1000 times per second with audio data
        namProcessor.process(buffer);
    }
};
```

### Thread Model

JUCE uses multiple threads:

1. **Audio Thread**: Runs `processBlock()` in real-time. Must never block.
2. **Message Thread**: Handles GUI updates and user interaction.
3. **Background Threads**: For file I/O, model loading, etc.

NAM integrates with this model:
- `loadModel()`: Called from background thread
- `process()`: Called from audio thread (uses atomic `modelLoaded` flag)
- Parameter changes: Use atomic variables or juce::SmoothedValue

---

## AudioBuffer Basics

JUCE's `AudioBuffer<float>` is how audio data moves around:

```cpp
juce::AudioBuffer<float> buffer(2, 512);  // 2 channels, 512 samples

// Get raw pointer for channel 0
float* leftChannel = buffer.getWritePointer(0);

// Get raw pointer for channel 1
float* rightChannel = buffer.getWritePointer(1);

// Get number of samples
int numSamples = buffer.getNumSamples();

// Get number of channels
int numChannels = buffer.getNumChannels();
```

NAM works with raw float pointers internally:

```cpp
void NAMProcessor::process(juce::AudioBuffer<float>& buffer) {
    float* data = buffer.getWritePointer(0);
    int numSamples = buffer.getNumSamples();

    // NAM's C API expects float* and sample count
    model->process(data, output, numSamples);
}
```

---

## Error Handling and Validation

### Input Validation

```cpp
void NAMProcessor::process(juce::AudioBuffer<float>& buffer)
{
    // Check for invalid values (NaN, Infinity)
    for (int i = 0; i < numSamples; i++) {
        if (!std::isfinite(data[i])) {
            data[i] = 0.0f;  // Replace with silence
        }
    }

    // Process...

    // Validate output too
    for (int i = 0; i < numSamples; i++) {
        if (!std::isfinite(output[i])) {
            output[i] = 0.0f;
        }
    }
}
```

### Denormal Flushing

```cpp
// Very small values can cause CPU spikes
if (std::abs(sample) < 1e-15f) {
    sample = 0.0f;
}
```

---

## Performance Considerations

### CPU Usage
NAM models are computationally intensive. Tips:

1. **Choose appropriate architecture**: ConvNet < LSTM < WaveNet in CPU cost
2. **Use silence detection**: Skip processing when no input
3. **Avoid resampling if possible**: Run DAW at model's native rate
4. **Buffer size**: Larger buffers = less overhead, more latency

### Latency
NAM itself adds minimal latency (one buffer's worth). The main latency in Harmonica comes from the Multivoicer's pitch shifter (~100ms).

### Memory Usage
Models typically use 10-50MB of RAM, depending on architecture.

---

## Common Issues and Solutions

### "Model won't load"
- Check file path is valid
- Ensure `.nam` file isn't corrupted
- Check if model architecture is supported

### "Audio dropouts when loading model"
- Load models on background thread, never audio thread
- Pre-load models during initialization

### "Tone sounds wrong"
- Check sample rate matches model's expected rate
- Verify model is actually loaded (`isModelLoaded()`)

### "High CPU usage"
- Try smaller model architecture
- Increase buffer size
- Enable silence detection

---

## Code Flow Summary

```
Guitar Signal
      │
      ▼
[JUCE AudioProcessor::processBlock()]
      │
      ▼
[NAMProcessor::process()]
      │
      ├── Model loaded? ──No──> Pass through unchanged
      │         │
      │        Yes
      │         │
      │         ▼
      │   [Sum to Mono]
      │         │
      │         ▼
      │   [Silence Detection]
      │         │
      │    ┌────┴────┐
      │   Yes       No
      │    │         │
      │    │    [Resampling needed?]
      │    │         │
      │    │    ┌────┴────┐
      │    │   Yes       No
      │    │    │         │
      │    │ [Upsample]   │
      │    │    │         │
      │    │    ▼         ▼
      │    │  [NAM Neural Network]
      │    │    │         │
      │    │ [Downsample] │
      │    │    │         │
      │    │    └────┬────┘
      │    │         │
      │    │    [Copy to Stereo]
      │    │         │
      └────┴─────────┘
              │
              ▼
      [Output to next stage]
```

---

## File References

| Component | File |
|-----------|------|
| NAM Processor | `Source/DSP/NAMProcessor.h`, `NAMProcessor.cpp` |
| Plugin Processor | `Source/PluginProcessor.h`, `PluginProcessor.cpp` |
| NAM Library | `extern/NAM/` (third-party) |

---

## Further Reading

- **JUCE Documentation**: https://juce.com/learn/documentation
- **NAM Project**: https://github.com/sdatkinson/neural-amp-modeler
- **Signalsmith Stretch**: https://signalsmith-audio.co.uk/code/stretch/
