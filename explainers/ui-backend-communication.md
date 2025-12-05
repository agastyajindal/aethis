# UI-Backend Communication - Technical Explainer

## Overview

Harmonica uses a modern web-based UI (built with Svelte/JavaScript) that communicates with the C++ audio backend (built with JUCE). This document explains how these two worlds connect and pass data back and forth.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                                                                   │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│   │   Svelte    │    │   Svelte    │    │   Svelte    │         │
│   │ Components  │    │ Components  │    │ Components  │         │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│          │                  │                  │                 │
│          └──────────────────┼──────────────────┘                 │
│                             ▼                                    │
│                      ┌────────────┐                              │
│                      │ juceBridge │  (JavaScript)                │
│                      └─────┬──────┘                              │
└────────────────────────────┼────────────────────────────────────┘
                             │
                    [JSON Messages]
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                            ▼                                     │
│                   ┌────────────────┐                             │
│                   │  WebView/CEF   │  (Platform-specific)        │
│                   └────────┬───────┘                             │
│                            │                                     │
│                            ▼                                     │
│                   ┌────────────────┐                             │
│                   │ PluginEditor   │  (C++)                      │
│                   └────────┬───────┘                             │
│                            │                                     │
│                            ▼                                     │
│                   ┌────────────────┐                             │
│                   │PluginProcessor │  (C++)                      │
│                   │    (APVTS)     │                             │
│                   └────────┬───────┘                             │
│                            │                                     │
│                            ▼                                     │
│                   ┌────────────────┐                             │
│                   │  DSP Classes   │  (Audio Thread)             │
│                   │ (NAM, Effects) │                             │
│                   └────────────────┘                             │
│                                                                  │
│                       AUDIO BACKEND                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## The juceBridge (JavaScript Side)

### What Is It?
`juceBridge.js` is a JavaScript module that provides the API for the UI to communicate with C++. It handles all the complexity of message passing, subscriptions, and data conversion.

### Location
`UI/src/juceBridge.js`

### Core Functionality

#### Sending Parameters to C++

```javascript
// In your Svelte component
import { juceBridge } from './juceBridge.js';

// When user moves a slider
function onSliderChange(value) {
    juceBridge.setParameter('amp1_input_gain', value);
}
```

What happens under the hood:

```javascript
setParameter(parameterId, value) {
    if (this.isJUCE) {
        // We're running inside JUCE's WebView
        window.__JUCE__.postMessage({
            type: 'setParameter',
            parameter: parameterId,
            value: value
        });
    } else {
        // We're in a browser for development
        console.log('Would set:', parameterId, '=', value);
    }
}
```

#### Receiving Parameters from C++

```javascript
// Subscribe to parameter changes
juceBridge.subscribe('amp1_input_gain', (value) => {
    sliderValue = value;  // Update your UI
});
```

The subscription system:

```javascript
class JuceBridge {
    subscribers = {};  // parameterId -> [callbacks]

    subscribe(parameterId, callback) {
        if (!this.subscribers[parameterId]) {
            this.subscribers[parameterId] = [];
        }
        this.subscribers[parameterId].push(callback);
    }

    notifySubscribers(parameterId, value) {
        const callbacks = this.subscribers[parameterId] || [];
        callbacks.forEach(cb => cb(value));
    }
}
```

#### Receiving Messages from C++

```javascript
handleBackendMessage(message) {
    // Message comes as JSON string from C++
    const data = typeof message === 'string'
        ? JSON.parse(message)
        : message;

    switch (data.type) {
        case 'parameterChanged':
            this.notifySubscribers(data.parameter, data.value);
            break;

        case 'allParameters':
            // Bulk update on startup
            for (const [id, value] of Object.entries(data.value)) {
                this.notifySubscribers(id, value);
            }
            break;

        case 'meterLevels':
            this.notifySubscribers('__meterLevels', data.value);
            break;

        case 'presetsList':
            this.notifySubscribers('__presets', data.value);
            break;
    }
}
```

---

## The PluginEditor (C++ Side)

### What Is It?
`PluginEditor` is the JUCE class that creates and manages the UI. It creates a WebView, loads the HTML/JS, and handles message passing.

### Location
`Source/PluginEditor.h` and `Source/PluginEditor.cpp`

### Platform Differences

**Windows**: Uses CEF (Chromium Embedded Framework)
```cpp
#if JUCE_WINDOWS
    std::unique_ptr<CEFBrowserComponent> cefBrowser;
#endif
```

**macOS**: Uses native WKWebView
```cpp
#if JUCE_MAC
    std::unique_ptr<juce::WebBrowserComponent> webView;
#endif
```

### Sending Messages to JavaScript

```cpp
void HarmonicaEditor::sendParameterToWebView(const juce::String& parameterId,
                                              float value)
{
    // Create JSON message
    juce::String script = "window.__JUCE__.backend(" +
        juce::JSON::toString(juce::DynamicObject::Ptr(new juce::DynamicObject(
            { { "type", "parameterChanged" },
              { "parameter", parameterId },
              { "value", value } }
        ))) + ");";

    // Execute in WebView
    #if USE_CEF
        cefBrowser->executeJavaScript(script);
    #else
        WebViewHelper::executeJavaScriptAsync(*webView, script);
    #endif
}
```

### Receiving Messages from JavaScript

```cpp
void HarmonicaEditor::handleWebViewMessage(const juce::String& message)
{
    // Parse JSON from JavaScript
    auto jsonData = juce::JSON::parse(message);
    auto type = jsonData.getProperty("type", "").toString();

    if (type == "setParameter")
    {
        auto parameterId = jsonData.getProperty("parameter", "").toString();
        auto value = static_cast<float>(jsonData.getProperty("value", 0.0));

        // Update the APVTS (AudioProcessorValueTreeState)
        if (auto* param = audioProcessor.getAPVTS().getParameter(parameterId))
        {
            param->setValueNotifyingHost(
                param->getNormalisableRange().convertTo0to1(value)
            );
        }
    }
    else if (type == "getPresets")
    {
        sendPresetsToWebView();
    }
    else if (type == "loadPresetByName")
    {
        auto presetName = jsonData.getProperty("presetName", "").toString();
        audioProcessor.loadPreset(presetName);
    }
    // ... more message types
}
```

---

## Parameter Naming Convention

All parameters follow a consistent naming scheme:

```
{component}_{parameter}
```

### Examples

| Parameter ID | Component | What It Controls |
|-------------|-----------|------------------|
| `amp1_input_gain` | Amp 1 | Input gain knob |
| `amp2_bass` | Amp 2 | Bass EQ |
| `mv_voice1_interval` | Multivoicer | Voice 1 pitch shift |
| `mv_dry_wet` | Multivoicer | Dry/wet mix |
| `drive_drive` | Drive Pedal | Distortion amount |
| `chorus_rate` | Chorus | Modulation speed |
| `delay_time` | Delay | Echo time |
| `pre_eq_band5` | Pre-EQ | Band 5 level |
| `global_input_gain` | Global | Master input |

### Finding All Parameters
All parameter IDs are defined in:
`Source/Parameters/ParameterIDs.h`

```cpp
namespace ParameterIDs
{
    // Global
    inline const juce::String globalInputGain { "global_input_gain" };
    inline const juce::String globalOutputGain { "global_output_gain" };
    inline const juce::String globalBypass { "global_bypass" };

    // Multivoicer
    inline const juce::String mvEnabled { "mv_enabled" };
    inline const juce::String mvDryWet { "mv_dry_wet" };
    inline const juce::String mvVoice1Enabled { "mv_voice1_enabled" };
    inline const juce::String mvVoice1Interval { "mv_voice1_interval" };
    // ... and many more
}
```

---

## Message Types Reference

### C++ → JavaScript

| Type | Purpose | Data |
|------|---------|------|
| `parameterChanged` | Single parameter update | `{ parameter, value }` |
| `allParameters` | Bulk sync on startup | `{ param1: val, param2: val, ... }` |
| `meterLevels` | Audio meters | `{ input: [L,R], output: [L,R] }` |
| `audioDevices` | Available hardware | `{ inputs: [...], outputs: [...] }` |
| `systemInfo` | System details | `{ sampleRate, bufferSize, ... }` |
| `presetsList` | Available presets | `{ current, presets: [...] }` |
| `presetImportResult` | Import status | `{ success, message }` |

### JavaScript → C++

| Type | Purpose | Data |
|------|---------|------|
| `setParameter` | Change parameter | `{ parameter, value }` |
| `getPresets` | Request presets | `{}` |
| `loadPresetByName` | Load preset | `{ presetName }` |
| `savePreset` | Save preset | `{ name, category }` |
| `getAudioDevices` | Request devices | `{}` |
| `getSystemInfo` | Request system info | `{}` |
| `command` | Generic command | `{ command: 'name' }` |
| `openPresetImportDialog` | Open file picker | `{}` |
| `openPresetExportDialog` | Open save dialog | `{}` |

---

## The APVTS (AudioProcessorValueTreeState)

### What Is It?
APVTS is JUCE's system for managing plugin parameters. It provides:
- Thread-safe parameter access
- Undo/redo support
- DAW automation
- Preset saving/loading

### How It Connects

```
UI Slider ─── juceBridge ─── PluginEditor ─── APVTS ─── DSP
              (JS)           (C++)            (C++)    (C++)
```

### Parameter Listener Pattern

The PluginEditor listens for parameter changes:

```cpp
class HarmonicaEditor : public juce::AudioProcessorValueTreeState::Listener
{
    void parameterChanged(const juce::String& parameterId, float newValue) override
    {
        // Update the UI when parameter changes
        sendParameterToWebView(parameterId, newValue);
    }
};
```

This ensures the UI stays in sync when:
- The DAW changes parameters via automation
- The user loads a preset
- Another part of the code changes a parameter

---

## Bulk Updates

### The Problem
On startup, we need to send ALL parameters to the UI. Sending them one by one would:
1. Be slow (hundreds of messages)
2. Cause UI flicker (many rapid redraws)

### The Solution

```cpp
void HarmonicaEditor::sendAllParametersToWebView()
{
    // Collect all parameters into one object
    juce::DynamicObject::Ptr params = new juce::DynamicObject();

    for (auto* param : audioProcessor.getParameters())
    {
        params->setProperty(param->getParameterID(), param->getValue());
    }

    // Send as single message
    juce::String script = "window.__JUCE__.backend(" +
        juce::JSON::toString(juce::DynamicObject::Ptr(new juce::DynamicObject({
            { "type", "allParameters" },
            { "value", params }
        }))) + ");";

    executeJavaScript(script);
}
```

On the JavaScript side:

```javascript
case 'allParameters':
    // Batch notifications in a single frame
    requestAnimationFrame(() => {
        for (const [id, value] of Object.entries(data.value)) {
            this.notifySubscribers(id, value);
        }
    });
    break;
```

---

## Suppressing Redundant Updates

### The Problem
When loading a preset, parameters change rapidly. We don't want to:
1. Send hundreds of messages to JS during load
2. Trigger expensive UI redraws for each one

### The Solution

```cpp
// In PluginEditor
std::atomic<bool> suppressParameterUpdates{false};

void loadPreset(const juce::String& presetName)
{
    // Suppress individual updates
    suppressParameterUpdates = true;

    // Load preset (changes many parameters)
    audioProcessor.loadPreset(presetName);

    // Re-enable updates
    suppressParameterUpdates = false;

    // Send one bulk update
    sendAllParametersToWebView();
}

void parameterChanged(const juce::String& parameterId, float newValue)
{
    if (suppressParameterUpdates.load())
        return;  // Skip during bulk operations

    sendParameterToWebView(parameterId, newValue);
}
```

---

## Meter Updates

### The Challenge
Audio meters need to update frequently (60fps ideally) but:
1. Sending 60 messages per second is expensive
2. The audio thread can't wait for the UI

### The Solution: Timer-Based Polling

```cpp
class HarmonicaEditor : public juce::Timer
{
    void timerCallback() override
    {
        // Called every 50ms (20fps)
        sendMeterLevelsToWebView();
    }
};
```

```cpp
void HarmonicaEditor::sendMeterLevelsToWebView()
{
    // Get levels from audio processor (lock-free)
    float inputL = audioProcessor.getInputLevelL();
    float inputR = audioProcessor.getInputLevelR();
    float outputL = audioProcessor.getOutputLevelL();
    float outputR = audioProcessor.getOutputLevelR();

    // Send to UI
    juce::String script = /* ... meter JSON ... */;
    executeJavaScript(script);
}
```

---

## Thread Safety

### The Danger
Two threads access parameters:
- **Audio Thread**: Reads parameters ~1000x/second for DSP
- **Message Thread**: Writes parameters when UI changes

### JUCE's Protection

```cpp
// APVTS parameters are thread-safe
auto* param = apvts.getParameter("amp1_gain");

// Safe to call from any thread
float value = param->getValue();

// Safe to call from message thread
param->setValueNotifyingHost(0.5f);
```

### Our Additional Protection

```cpp
// Atomic flags for state
std::atomic<bool> suppressParameterUpdates{false};
std::atomic<bool> webUILoaded{false};

// Check before executing JavaScript
if (webUILoaded.load() && cefBrowser != nullptr)
{
    cefBrowser->executeJavaScript(script);
}
```

---

## Debugging Tips

### Enable Logging

In the C++ code, messages are logged:
```cpp
DBG("WebView message: " << message);
FLOG("Parameter changed: " << parameterId << " = " << value);
```

### Check the Bridge

In browser console (when running standalone UI):
```javascript
juceBridge.setParameter('test', 0.5);
// Should log: "Would set: test = 0.5"
```

### Inspect Messages

Add logging to `handleWebViewMessage`:
```cpp
void handleWebViewMessage(const juce::String& message)
{
    DBG("Received: " << message);
    // ... rest of handler
}
```

---

## Common Issues

### "Parameter not updating in UI"
1. Check parameter ID matches exactly (case-sensitive)
2. Verify juceBridge subscription is active
3. Check if `suppressParameterUpdates` is stuck true

### "UI changes don't affect sound"
1. Verify parameter ID exists in APVTS
2. Check the message is reaching `handleWebViewMessage`
3. Ensure DSP code reads from APVTS

### "Bulk update not working"
1. Check `webUILoaded` flag is set
2. Verify JavaScript `backend` function exists
3. Look for JSON parsing errors in console

---

## File References

| Component | Files |
|-----------|-------|
| JavaScript Bridge | `UI/src/juceBridge.js` |
| Plugin Editor | `Source/PluginEditor.h`, `PluginEditor.cpp` |
| Plugin Processor | `Source/PluginProcessor.h`, `PluginProcessor.cpp` |
| Parameter IDs | `Source/Parameters/ParameterIDs.h` |
| CEF Component | `Source/UI/CEFBrowserComponent.h`, `.cpp` |
| WebView Helper | `Source/UI/WebViewHelper.h` |
