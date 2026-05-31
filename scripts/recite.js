// PHONEMOTRON · streaming mode · text-transformation use
// Drive the instrument as a continuous voice over time: each line of text is
// translated to phonemes and spoken, with HARMONY + register + tempo + breath
// chosen from the line's affect. One page session, one continuous recording.
//
// Affect is meant to be INFERRED from each line's meaning by the operating AI
// (happy thought -> major, grief -> minor, open question -> Lydian/quartal),
// or hand-tagged to override. Edit SCRIPT (the words) and AFFECTS (the map).
// Pair in a recipe with:  capture_download: "*.wav"
(async () => {
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const note = (type, key) => window.postMessage({ type, key }, '*');

  // --- SCRIPT: text + affect per line. Affect drives the music. -----------
  const SCRIPT = [
    { text: 'the morning light is bright and clear', affect: 'bright' },
    { text: 'I remember summers long ago',           affect: 'warm' },
    { text: 'and then the cold grey winter came',    affect: 'melancholy' },
    { text: 'but what comes next',                   affect: 'tense' },
    { text: 'we begin again',                        affect: 'calm' },
  ];

  // --- AFFECT -> MUSIC map (all values are valid app option values) -------
  // chord: harmony · dur: base-dur, higher = slower/clearer · key: pitch
  // lfo/depth: vocal modulation (breath/vibrato) · gap: pause after line (ms)
  const AFFECTS = {
    bright:     { chord: 'maj9',    dur: '110', key: 'l', lfo: 'aspiration', depth: 0.08, gap: 250 },
    warm:       { chord: 'add9',    dur: '130', key: 'k', lfo: 'aspiration', depth: 0.12, gap: 350 },
    calm:       { chord: 'sus2',    dur: '150', key: 'h', lfo: 'vibrato',    depth: 0.10, gap: 450 },
    melancholy: { chord: 'min9',    dur: '200', key: 'd', lfo: 'aspiration', depth: 0.20, gap: 650 },
    tense:      { chord: 'maj7s11', dur: '130', key: 'g', lfo: 'tilt',       depth: 0.22, gap: 400 },
    dark:       { chord: 'min6',    dur: '300', key: 'a', lfo: 'aspiration', depth: 0.18, gap: 700 },
  };
  // questions lift in pitch: bump up one white key
  const UP = { a: 's', s: 'd', d: 'f', f: 'g', g: 'h', h: 'j', j: 'k', k: 'l', l: ';', ';': "'" };
  // ------------------------------------------------------------------------

  const setSel = (sel, v) => { const e = $(sel); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); };
  const setRange = (sel, v) => { const e = $(sel); if (!e) return; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };

  // boot audio + fixed patch
  const welcome = $('#welcome-musical-typing');
  if (welcome && welcome.offsetParent !== null) { welcome.click(); await sleep(1800); }
  const chordOn = $('#chord-on'); if (chordOn && !chordOn.checked) chordOn.click();
  const loop = $('#loop-on'); if (loop && loop.checked) loop.click();
  const delayOn = $('#delay-on'); if (delayOn && !delayOn.checked) delayOn.click();
  setRange('#lfo1-rate', 1.2);
  await sleep(100);

  const seq = $('#seq');

  // Capture translate.php refusals directly so we can abort with a clear reason.
  let lastTranslate = null;
  const _fetch = window.fetch;
  window.fetch = async (...a) => {
    const r = await _fetch(...a);
    try {
      const u = typeof a[0] === 'string' ? a[0] : a[0] && a[0].url;
      if (u && u.includes('translate.php')) lastTranslate = await r.clone().json().catch(() => null);
    } catch (_) {}
    return r;
  };

  // --- 1. translate pass (recorder OFF). Uses the app's own translate.php. -
  // FAIL FAST on refusal: a rate-limited line never changes #seq, so without
  // this the loop burns ~7s per line and then performs raw English (silent or
  // garbled). The server caps at ~100 translations/hr; see references/sequencer-language.md.
  const lines = [];
  for (const line of SCRIPT) {
    lastTranslate = null;
    seq.value = line.text;
    seq.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(150);
    $('#translate-btn').click();
    let arpa = line.text;
    for (let i = 0; i < 28; i++) { await sleep(250); if (seq.value !== line.text) { arpa = seq.value; break; } }
    if (lastTranslate && lastTranslate.success === false) {
      const why = lastTranslate.rate_limited ? 'rate-limited (~100/hr)' : 'refused';
      throw new Error(`translate.php ${why}: ${lastTranslate.error || ''}. Wait ~1hr, render in smaller chunks, or supply cached ARPABET. Stopped at: "${line.text}"`);
    }
    if (arpa === line.text) {
      throw new Error(`translate timed out for "${line.text}" — no ARPABET returned (likely rate-limited ~100/hr or offline). Wait or chunk smaller.`);
    }
    lines.push({ ...line, arpa, ok: true });
    await sleep(300); // be gentle with the server (rate-limited)
  }

  // --- 2. perform (recorder ON) -------------------------------------------
  const rec = $('#rec-toggle');
  rec.click();
  for (const line of lines) {
    const a = AFFECTS[line.affect] || AFFECTS.warm;
    let key = a.key;
    if (line.text.trim().endsWith('?') || /\b(what|why|how|when|where|who)\b/i.test(line.text)) key = UP[key] || key;

    seq.value = line.arpa;
    seq.dispatchEvent(new Event('input', { bubbles: true }));
    setSel('#chord-type', a.chord);
    setSel('#base-dur', a.dur);
    setSel('#lfo1-target', a.lfo);
    setRange('#lfo1-depth', a.depth);
    await sleep(140); // let state settle before note-on

    const phonemes = line.arpa.trim().split(/\s+/).length;
    const hold = Math.min(7000, phonemes * Number(a.dur) + 300);
    note('keydown', key);
    await sleep(hold);
    note('keyup', key);
    await sleep(a.gap);
  }
  rec.click();
  await sleep(700);

  return JSON.stringify({ lines });
})()
