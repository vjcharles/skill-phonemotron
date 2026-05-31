// PHONEMOTRON — the PERFORMANCE half of a take. Plays a timed score and records.
// Phonemotron is a *played* instrument: note on/off timing is part of the
// instrument, not a side effect. Edit the SCORE to compose the performance.
//
// Each event holds one musical-typing key for the window [on, off) in ms from
// the start of the take. Overlap events (same `on`) to play chords; the preset's
// autochord can also turn a single key into a chord.
//
// Musical-typing key -> note (octave-shift in the preset moves all of these):
//   white  a48 s50 d52 f53 g55 h57 j59 k60(C4) l62 ;64 '65
//   black  w49 e51 t54 y56 u58 o61 p63
//
// Awaited IIFE so browser-runner's capture_download can await the WAV download.
// Pair in a recipe with:  capture_download: "*.wav"
(async () => {
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- SCORE: edit me -----------------------------------------------------
  const SCORE = [
    { key: 'k', on: 0,    off: 1400 }, // C4
    { key: 'h', on: 1400, off: 2800 }, // A3
    { key: 'k', on: 2800, off: 4400 }, // C4
  ];
  const TAIL_MS = 900; // record past the last note-off to catch the release tail
  // ------------------------------------------------------------------------

  // Ensure audio is live if perform.js is run on its own (no-op after preset.js).
  const welcome = $('#welcome-musical-typing');
  if (welcome && welcome.offsetParent !== null) { welcome.click(); await sleep(1800); }

  const note = (type, key) => window.postMessage({ type, key }, '*');
  const end = Math.max(...SCORE.map((e) => e.off)) + TAIL_MS;

  const rec = $('#rec-toggle');
  rec.click(); // start recording
  for (const e of SCORE) {
    setTimeout(() => note('keydown', e.key), e.on);
    setTimeout(() => note('keyup', e.key), e.off);
  }
  await sleep(end);
  rec.click(); // stop -> fires WAV download
  await sleep(600);
  for (const e of SCORE) note('keyup', e.key); // safety release

  return JSON.stringify({ events: SCORE.length, durationMs: end });
})()
