// PHONEMOTRON — emit the app-native preset (the SHARE artifact).
// Run AFTER preset.js so it reflects the applied patch. It drives the app's own
// Export -> Save, which downloads phonemotron-<name>.txt: the bare preset object
// a human pastes into Import (or loads directly), with zero tooling. Capturing
// the app's real download (not a stringified return) keeps the file unescaped.
// Pair in a recipe with `capture_download: "*.txt"`.
(async () => {
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const LABEL = 'session'; // match the preset `label`

  // Open Export; the app fills #export-textarea with the bare object.
  $('#export-preset').click();
  await sleep(300);
  // Name it so the downloaded file + object label match the patch.
  const name = $('#export-name-input');
  if (name) {
    name.value = LABEL;
    name.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(150);
  }
  // Save -> downloads phonemotron-<name>.txt (the app-native preset file).
  $('#export-save-btn').click();
  await sleep(500);

  return JSON.stringify({ exported: LABEL });
})()
