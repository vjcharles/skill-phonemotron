// PHONEMOTRON — the SOUND half of a take. Sets the patch + phonemes.
// Edit the PRESET object below. This is the app's own export format: a loose
// JS object literal (single quotes, trailing commas OK) — NOT strict JSON.
// Applied via the app's Import dialog, so it drives every control at once.
//
// Usable as a browser-runner eval or pasted into devtools.
(async () => {
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- PRESET: edit me ----------------------------------------------------
  // `text`   : ARPABET phonemes the synth sings (use #translate-btn in the GUI
  //            to turn English into ARPABET, then copy the result here).
  // controls : engine-internal value strings, not UI labels
  //            (e.g. UI "Breathiness" = 'aspiration', UI "Major 9th" = 'maj9').
  // loop-on true = one held note replays the phrase for as long as it's held,
  //            so the SCORE's note on/off timing (perform.js) shapes phrasing.
  const PRESET = `{
    label: 'session',
    text: "F OW N AA M OW T R AA N",
    controls: {
      'base-dur': 110, 'loop-on': true, 'voice-mode': 'poly', 'fixed-vel': true,
      'pb-target': 7, 'global-bpm': 96,
      'arp-on': false, 'chord-on': true, 'chord-type': 'maj9',
      'delay-on': true, 'delay-div': '1/8', 'delay-fb': 45, 'delay-pitch': 0,
      'lfo1-target': 'aspiration', 'lfo1-rate': 1.2, 'lfo1-depth': 0.15,
      'octave-shift': 0,
    },
  }`;
  // ------------------------------------------------------------------------

  // Enable musical typing + boot audio. The welcome button gates initAudio()
  // (async, ~1.5s to load the AudioWorklet). No-op if already dismissed.
  const welcome = $('#welcome-musical-typing');
  if (welcome && welcome.offsetParent !== null) { welcome.click(); await sleep(1800); }

  // Apply the preset through the app's own Import path.
  $('#import-preset').click();
  await sleep(300);
  const ta = $('#import-textarea');
  ta.value = PRESET;
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(150);
  $('#import-load-btn').click();
  await sleep(500);
  const close = $('#import-close-btn');
  if (close && close.offsetParent !== null) close.click();
  await sleep(150);

  return JSON.stringify({ applied: true, bpm: $('#global-bpm') && $('#global-bpm').value });
})()
