#!/bin/bash
# Bundle a phonemotron take for handoff. The share bundle is tool-agnostic and
# Gmail-safe: only the take audio, the app-native preset, and a short README.
# The automation (preset.js / perform.js / take.yaml) stays in the working dir
# with the agent and human who made it.
#
# Usage: share.sh <workdir> [label]
#   <workdir>  the ./phonemotron-<label>/ dir holding the take outputs
#   [label]    patch name; defaults to the dir's trailing <label>
#
# Produces: <workdir>/<label>-share/  and  <workdir>/<label>-share.zip
set -euo pipefail
shopt -s nullglob

work="${1:?usage: share.sh <workdir> [label]}"
[ -d "$work" ] || { echo "no such dir: $work" >&2; exit 1; }
label="${2:-$(basename "$work" | sed 's/^phonemotron-//')}"

cd "$work"
bundle="${label}-share"
rm -rf "$bundle" "$bundle.zip"
mkdir -p "$bundle"

# the listen: every take/recite WAV
wavs=( *-take-*.wav *-recite-*.wav )
[ ${#wavs[@]} -gt 0 ] || { echo "no take WAVs in $work" >&2; exit 1; }
cp -- "${wavs[@]}" "$bundle"/

# the sound: app-native preset (importable as-is)
preset="${label}.preset.txt"
[ -f "$preset" ] && cp -- "$preset" "$bundle"/ || echo "warn: no $preset (sound not shareable)" >&2

# up to 3 lines
cat > "$bundle/README.txt" <<EOF
Phonemotron take "${label}" — listen to the .wav.
Reproduce the sound: open https://cantonbecker.com/phonemotron/, Import the .preset.txt, hold one key (k = C4).
The preset is the sound only; playing the note performs it.
EOF

zip -qr "$bundle.zip" "$bundle"
echo "bundled: $work/$bundle.zip"
ls -1 "$bundle"
