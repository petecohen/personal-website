---
title: "One Footswitch, Two Systems: How I Built a MIDI-to-OSC Bridge for Live Streaming Music"
date: 2026-04-25
summary: "A single footswitch press simultaneously controls the audio mixer and switches camera scenes on a separate machine, all over the local network."
---

I've been live streaming music performances since 2013, starting on Stageit back when the whole concept felt pretty fringe. Since then I've moved through a few platforms and a lot of iterations of the rig, always chasing the same two things: make the stream as engaging as possible for the audience, and reduce the cognitive load on the performers so we can actually focus on playing.

When you're a duo performing live — in our case, Smith & Cohen — you don't have a camera operator, a sound engineer sitting out front, or a producer calling shots. You're doing everything yourselves. So every piece of the production that can be automated or reduced to a single action is a win. The fewer things you have to think about between songs, the better the performance.

This is the latest incarnation of that pursuit: a system where a single footswitch press simultaneously controls the audio mixer and switches camera scenes on a completely separate machine, all over the local network.

## The problem

Our streaming setup has three distinct modes:

1. **Talk Mode** — we're chatting to the audience between songs. Reverb should be off (otherwise your speaking voice sounds like you're in a cathedral), and the camera should be a simple front shot.

2. **Vocal Song Mode** — we're performing a song with vocals. Reverb comes back on, and the cameras should auto-switch between multiple angles to keep it visually interesting.

3. **Instrumental Song Mode** — same deal but with a different camera rotation suited to instrumental pieces.

Previously, switching between these modes meant reaching for the iPad to toggle the mute group on the mixer, then clicking around in Ecamm Live on the Mac Studio to change the scene. That's two separate actions on two separate devices, and when you're about to launch into a song, the last thing you want is to be fumbling with screens.

I wanted one footswitch press to handle everything.

## The hardware

Here's what's in the rig:

**Mac Studio** — the streaming brain. It runs Ecamm Live with four cameras connected. The XR18 connects to the Mac Studio via USB as the audio interface that drives Ecamm. It also runs Keyboard Maestro, which acts as a remote trigger receiver.

**Behringer XR18** — a digital mixer that handles all our audio. It connects to the Mac Studio via USB as an audio interface, and is also on the network (via Ethernet) where it accepts OSC control commands. I typically run X-AIR Edit on the Mac Studio and an iPad simultaneously for mixing.

**Intel MacBook Pro** — sits on the performer side of the rig. The MC8 Pro connects to it via USB, and it's connected to a separate audio interface that sends our audio into the XR18. It's on the same network (via Wi-Fi) as the XR18 and Mac Studio, and runs the Python script that bridges everything together.

**Morningstar MC8 Pro** — an eight-switch MIDI foot controller. Three switches are dedicated to the three streaming modes. It connects via USB to the Intel MacBook Pro.

## The signal chain

```
MC8 Pro foot switch
  → USB MIDI (CC message) → Intel MacBook Pro
  → Python script simultaneously sends:
      1. OSC command to XR18 → toggles mute group (reverb on/off)
      2. HTTP request to Mac Studio → Keyboard Maestro → switches Ecamm scene
```

The foot controller sends a MIDI Control Change message. The Python script on the MacBook Pro listens for these messages and fires two actions in parallel: an OSC command to the mixer over Wi-Fi, and an HTTP request to the Mac Studio over the same network. The HTTP request triggers a Keyboard Maestro macro, which in turn sends a keystroke to Ecamm Live to switch scenes.

One press. Two systems. No screens to touch.

## Why not just send the keystroke directly from the MC8?

The MC8 Pro does support a Keystroke message type, which can simulate keyboard shortcuts on whatever computer it's connected to via USB. That would work if the MC8 were plugged into the Mac Studio. But it's not — it's on the Intel MacBook Pro, which is the audio machine. The streaming machine is across the room.

So the keystroke approach only solves half the problem. We still need to get a signal across the network to the Mac Studio, and we still need to control the XR18 via OSC, which isn't MIDI at all. The Python script bridges both gaps.

## Why not use USB to control the XR18?

This is one of those assumptions that sounds reasonable but doesn't hold up. The XR18's USB connection to the Mac Studio is purely an audio interface — it provides 18 channels of audio input and output. It doesn't accept control commands via USB. All control happens via OSC over the network. The MC8 Pro isn't connected to the XR18 at all — it's on the Intel MacBook Pro, which sends audio into the XR18 through a separate interface. The Python script on the MacBook Pro sends OSC commands to the XR18 over Wi-Fi, which is the only way to control it programmatically.

## The Python script

The script is around 180 lines and does a few things:

**Auto-discovers the XR18** on the local network by broadcasting an OSC `/xinfo` query. The mixer responds with its IP address, name, model, and firmware version. This means you never need to hardcode an IP — just make sure the MacBook Pro is on the same Wi-Fi network as the mixer.

**Listens for MIDI CC messages** from the MC8 Pro via USB. Each of the three scene switches sends a different CC number (50, 51, 52), all with value 127. No toggle mode — each switch always does the same thing.

**Sends OSC to the XR18** to set the mute group state. `/config/mute/1` with a value of 1 (muted) for Talk Mode, or 0 (unmuted) for the song modes.

**Sends an HTTP request to Keyboard Maestro** on the Mac Studio. This runs in a background thread so the HTTP latency doesn't block the MIDI processing. KM receives the request and sends a keystroke to Ecamm Live to switch scenes.

The whole thing is a `CC_SCENE_MAP` dictionary that maps each CC number to a mute group state and a Keyboard Maestro macro UUID. Adding a new scene is just adding another entry to the dictionary and a new switch on the MC8.

## The Keyboard Maestro gotcha

This was the most frustrating part of the setup. Keyboard Maestro has a built-in web server for triggering macros remotely, which sounds perfect. But the commonly documented URL format — `/action/trigger?macro=MacroName` — doesn't work. It returns "File Not Looked For" regardless of whether the macro name is correct.

The working URL format is:

```
http://<ip>:4490/action.html?macro=<UUID>&value=
```

And you can't just use the macro's name — you need its internal UUID. The non-obvious way to find this: go to the KM web server page in a browser, select the macro from the Public Macros dropdown, click Execute, and copy the UUID from the address bar. That UUID is what the script uses.

Macros also need a **Public Web** trigger set on them, or the web server won't expose them.

## Auto-switching cameras with weighted dwell times

Ecamm Live has automatic scene groups that cycle through a folder of scenes at a set interval. This is great for creating that multi-camera look during songs without needing someone to direct. But it has a limitation: the time interval applies equally to every scene in the group. There's no per-scene dwell time.

This is a problem when you've got instrument close-up cameras in the mix alongside main front shots. A close-up of a hand on the fretboard is a great two-second cutaway, but if the random timing lingers on it for eight seconds, it looks odd.

The fix is to **duplicate your main camera scenes** in the auto group. If "Front Wide" and "Front Medium" each appear three times but each close-up only appears once, the auto group naturally spends most of its time on the main angles, with close-ups appearing as brief punctuations.

Set the group to **sequential** mode with a **randomised time range** (say 4–8 seconds), and use **hard cuts (No Transition)** rather than dissolves. Hard cuts are essential here — with a dissolve, switching from "Front Wide" to another identical "Front Wide" creates a visible flash. Hard cuts make the duplicates invisible. They also look more professional for music performance. Real multi-camera TV broadcasts use hard cuts between angles.

## MC8 Pro visual feedback

The MC8 Pro has colour LEDs on each switch. Using the **Set Toggle** feature, each of the three scene switches changes the LED colour of the other two when pressed. So at a glance during a performance, you can see which mode is active — Talk Mode might be red, Vocal Song green, Instrumental Song blue.

The key here is to use Set Toggle messages, not Toggle Groups. Toggle Groups affect all switches in the group, which can interfere with other switches in the same bank. Set Toggle gives you precise control over exactly which switches get reset.

## What it's like to use

In practice, the experience during a stream is this: we finish a song, I tap Switch A with my foot, the reverb drops out and the camera cuts to the front shot. We chat for a bit, I tap Switch B, the reverb comes back and the cameras start cycling through angles. We play.

There's no reaching for screens, no double-checking whether the reverb is on, no wondering which camera the audience is seeing. The LED on the MC8 tells me what mode I'm in. The script handles the rest.

The setup time is minimal too. Power on the XR18, plug the MC8 into the MacBook Pro, run the script. It auto-discovers the mixer, auto-detects the foot controller, and prints a summary of the mapping. Everything is ready in about ten seconds.

## The stack

For anyone wanting to build something similar, here's what you need:

**Hardware:**
- A Morningstar MC8 or MC8 Pro foot controller (any Morningstar controller that sends CC messages will work)
- A Behringer XR18 (or any X Air series mixer — XR12, XR16, X32 should all respond to the same OSC commands)
- Two Macs on the same network (one for the control script and performer audio, one for streaming)
- A separate audio interface on the performer's machine to send audio into the mixer
- Whatever cameras you're using with your streaming software

**Software:**
- Python 3 with `python-osc`, `mido`, `python-rtmidi`, and `requests`
- Keyboard Maestro on the streaming Mac (with web server enabled)
- Ecamm Live (or potentially OBS or any streaming software that responds to keyboard shortcuts)
- The control script — about 180 lines of Python

**Key protocols:**
- MIDI over USB (MC8 to MacBook Pro)
- OSC over Wi-Fi (MacBook Pro to XR18, port 10024)
- HTTP over Wi-Fi (MacBook Pro to Mac Studio, KM web server on port 4490)

The whole system could be adapted for other streaming setups. The Keyboard Maestro trigger could send any keystroke to any application, and the OSC commands could control anything on the XR18 — not just mute groups. Fader levels, effects parameters, bus routing — it's all accessible via OSC.

## What's next

The beauty of this approach is that it's extensible. I've got basically unlimited switches on the MC8 Pro which could trigger overlays, start and stop recordings, control lighting, or send OSC commands to other devices. The Python script is just a dictionary mapping CC numbers to actions — adding a new function is a few lines of code.

Thirteen years of iterating on live streaming rigs, and this is the first time it's felt like the technology is genuinely out of the way. Which is exactly how it should be when you're trying to play music.
