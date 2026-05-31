# skill-phonemotron

An agent skill for **Phonemotron**, a browser-based retro formant vocal synthesizer at <https://cantonbecker.com/phonemotron/>.

You give it ARPABET phonemes (or English, auto-translated) and play notes; it sings the phonemes at the pitches you play, shaped by autochord, arpeggiator, delay, and an LFO. A robot choir that sings your words. Pure Web Audio, built on the klattsch Klatt speech synth.

> **Pairs with [`skill-browser-runner`](https://github.com/vjcharles/skill-browser-runner)** for AI-driven mode (the agent operates the synth headlessly). Learning mode works on its own.

## What you take away from a session

1. **The listen.** A sung phrase you shaped.
2. **A `.wav` file** of the take, from the app's own EXPORT WAV FILE recorder.
3. **A preset object** that reproduces the sound, plus a score (the timed note events) that reproduces the performance. Sound plus score equals the take.
4. **A share bundle.** The `.wav`, the app-native preset `.txt`, and a short README: the tool-agnostic subset anyone can use, no skill required.

## Getting started

**Install.** Download the latest release zip and unpack into your agent host's skills directory (`~/.claude/skills/` for Claude Code; check your host's docs for Gemini, Codex, etc.):

```bash
curl -L https://github.com/vjcharles/skill-phonemotron/releases/latest/download/phonemotron.zip -o /tmp/phonemotron.zip
unzip /tmp/phonemotron.zip -d ~/.claude/skills/
```

That's the whole install for **learning mode** (a human at the GUI, the agent narrates).

For **AI-driven mode** (the agent operates the synth headlessly), also install the companion primitive `skill-browser-runner` (this skill declares it via `depends_on:` in the SKILL.md frontmatter):

```bash
curl -L https://github.com/vjcharles/skill-browser-runner/releases/latest/download/browser-runner.zip -o /tmp/browser-runner.zip
unzip /tmp/browser-runner.zip -d ~/.claude/skills/
cd ~/.claude/skills/browser-runner && npm install
```

`npm install` pulls Playwright plus bundled Chromium (~150MB, one time per host). The app loads from `cantonbecker.com` and its English-to-ARPABET step is a live server call, so a sandboxed environment needs network egress for AI-driven runs.

**Two ways in.** Pick the one that matches how you want to use the skill.

*Learning (you at the GUI, the agent narrates):*

> *"Use the phonemotron skill to walk me through the synth."*

Close variants: *"teach me phonemotron"*, *"let's explore phonemotron together"*. The agent directs you to <https://cantonbecker.com/phonemotron/>, narrates the panel, and helps you play a phrase. No browser-runner needed.

*AI-driven (the agent operates the synth, you listen):*

> `/phonemotron sing me a phrase and show me the file.`

The agent opens the page headlessly, applies a preset, plays a timed score, records a take, and hands you the `.wav`. Refine from there in chat: *"sadder"*, *"slower, with a pause between the words"*, *"recite this poem with feeling"* (each turn rolls a new take). Requires `skill-browser-runner` (see install above).

## What this skill teaches an agent

- **Narrate the instrument** to a human at the GUI (learning mode).
- **Operate the instrument headlessly** via the `browser-runner` primitive this skill depends on (AI-driven mode): render a **take**, **stream** affect-tagged text as a continuous voice, and bundle a take to **share**.

The full skill lives in [`SKILL.md`](SKILL.md). The instrument's sequencer language (phoneme bank, pauses, stress, inline pitch and directives) is captured as a dated snapshot in [`references/sequencer-language.md`](references/sequencer-language.md). Helper scripts and the canonical recipes are in [`scripts/`](scripts/).

## Attribution

Phonemotron is a public work available at <https://cantonbecker.com/phonemotron/>, built on the klattsch Klatt speech synth. This skill is a *wrapper*: it does not redistribute upstream code, only describes how to drive the page.

The screenshot at [`assets/screenshot.png`](assets/screenshot.png) is included for illustration. See [`assets/CREDITS.md`](assets/CREDITS.md).

## License

[MIT](LICENSE) for the skill's prose, scripts, and preset format. The screenshot is separately credited; see `LICENSE` and `assets/CREDITS.md`.
