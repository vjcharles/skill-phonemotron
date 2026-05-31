# Phonemotron — the instrument's language (sequencer grammar + phoneme bank)

What you type into the **Phoneme Sequencer** (`#seq`) is not just ARPABET — it is a small
**DSL** compiled by `src/engine/sequencer.js` (`compileString`). This is a **snapshot** of that
grammar so an agent need not re-read the app's source. The page mutates; this captures a
working version.

- **Source:** <https://cantonbecker.com/phonemotron/> · `src/engine/sequencer.js`,
  `src/engine/banks/bundled.js`
- **Snapshot:** app `?v=2026-05-29-14-21`, taken 2026-05-29
- **Default bank:** `klatt1980-en` — "English (Klatt 1980)" (en-US), schemaVersion 1

> **Unknown tokens are silently skipped** (a `warnings[]` entry, no audio). An off-bank code
> or a mistyped directive just drops out — a frequent cause of a quieter-than-expected or
> silent take. Stay on the inventory and grammar below.

## Phoneme inventory (klatt1980-en, 39 codes)

ARPABET, uppercase, space-separated. `text` is a sequence of these.

| group | codes |
|---|---|
| vowels (monophthong) | `IY IH EH AE AA AO AH UH UW ER` |
| vowels (diphthong, glide) | `AY AW EY OW OY` |
| approximants | `W Y R L` |
| nasals | `M N NG` |
| fricatives | `F TH S SH V DH Z ZH HH` |
| stops / affricates | `P B T D K G CH JH` (rendered with a burst; `isStop`) |

Plus **`_`** — a single phoneme-slot of **silence** (voiceless, zero amplitude). Use it for a
*rate-scaled* gap inside a word; use punctuation (below) for *fixed-ms* pauses between words.

English → ARPABET: type words and press **TRANSLATE TO ARPABET** (`#translate-btn`, the app's
own `translate.php` dictionary), then copy the result into `text`.

## `translate.php` (English → ARPABET endpoint)

`#translate-btn` calls a **live server** endpoint. You can also call it directly to batch a
passage (one call per line) instead of clicking through the GUI:

- **Request:** `POST https://cantonbecker.com/phonemotron/translate.php`,
  header `Content-Type: application/json`, **JSON body** `{"text": "hello world"}`.
  (GET `?text=` / `?word=` and form-encoded bodies all return `"No text provided"` — it reads
  the JSON body only.)
- **Success:** `{"success": true, "phonemes": "HH AH L OW W ER L D"}`.
- **Refused:** `{"success": false, "rate_limited": true, "error": "...overloaded...try again
  in an hour"}`.
- **Rate limit: ~100 translations/hour** (site author's ceiling; was 30, raised 2026-05-30).
  A take of N lines costs N live calls; **pace requests** (a short sleep between calls) and
  treat the limit as shared across recent renders. When refused, the cooldown is ~1 hour.

This is a network host: in a sandboxed environment, both browser-runner and any `curl` to it
need network egress (sandbox-disabled).

## Pauses / silence

Fixed-duration gaps, written as bare punctuation tokens (space-separated like phonemes):

| token | silence |
|---|---|
| `,` | 100 ms |
| `;` | 200 ms |
| `.` | 300 ms |

For an arbitrary pause use the directive `p<ms>` (e.g. `p250`). `_` is a *phoneme-length*
silence instead (scales with `rate`). Example: `HH AH L OW . W ER L D` = "hello, world" with a
300 ms beat between.

## Stress

A phoneme is stressed by a trailing `'` or `!` (`AH'`), or a standalone `'` / `!` token right
after it. Stressed → **1.5× duration** and a small **F0 lift** (+8 Hz). Example: `P ER' M IH T`.

## Per-phoneme pitch (melody within one held note)

A signed number on a phoneme bends F0 (Hz):

- **Sticky** `AH+2` — shifts the running pitch and **stays** shifted for what follows.
- **Transient** `AH(+2)` — shifts **only** that phoneme; pitch reverts after.

This means a melodic contour can live **inside a single held note** by writing the deltas into
the phoneme string — you do not have to trigger one note per syllable. (The SKILL.md "singing"
use can be done this way, or by note-per-chunk; this is the lighter path.)

## Inline directives

Change synthesis state mid-string. Two spellings:

**Compact letter form** `<letter><value>`: set `r130`, relative `r+20` / `r-20`, bare letter
`r` resets to the patch default.

| letter | controls | letter | controls |
|---|---|---|---|
| `b` | base pitch / F0 (Hz) | `v` | vibrato depth |
| `r` | rate (ms per phoneme) | `w` | vibrato rate |
| `s` | formant scale | `m` | tremolo depth |
| `h` | aspiration (breathiness) | `n` | tremolo rate |
| `t` | spectral tilt | `g` | vocal effort |
| `p` | pause (ms; see above) | | |

**Note-name base pitch:** `b=C4` or `bC4` sets F0 by note name (`A-1`…, accidentals `b`/`#`).
**Bracket form:** `[rate=130]`, `[base=…]`, etc. — same keys, explicit.

## Syllable grouping `( … )`

Phonemes inside one `( … )` group share a **single rate slot** (squeezed into one beat) rather
than one slot each. Use to keep a multi-phoneme syllable rhythmically tight. No nesting.

## Banks

`[bank=ja-hecko-2026]` switches the phoneme bank mid-string; `[bank]` resets to default.
Bundled banks: `klatt1980-en` (default), `ja-hecko-2026`, `ja-mokhtari-2000` (Japanese vowels).

## Comments

`#` starts a line comment (only at start-of-input or after whitespace). `/* … */` is a block
comment. Both are stripped before compilation — handy for annotating a long score in `text`.

## Robustness (why odd input sometimes still works)

Before tokenizing, input is NFKC-normalized, zero-width characters are stripped, and Greek/
Cyrillic homoglyphs (e.g. Cyrillic `А`, Greek `Α`) are mapped to Latin. You can usually paste
loosely; but unknown *codes* still drop silently.

## Quick reference (one line)

```
PHONEMES: 39 ARPABET codes + _ (slot silence)
PAUSE:    , 100ms   ; 200ms   . 300ms   p<ms> arbitrary
STRESS:   AH'  or  AH!        (1.5x dur, +8Hz)
PITCH:    AH+2 sticky   AH(+2) transient   b=C4 set base by note
STATE:    r rate · b base · s scale · v/w vibrato · m/n tremolo · h asp · t tilt · g effort
GROUP:    ( ... ) one rate slot      BANK: [bank=name] / [bank]      COMMENT: # ...  /* ... */
```
