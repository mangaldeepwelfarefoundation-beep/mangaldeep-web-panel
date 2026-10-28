// Fixes for clipped / broken Hindi text in @react-pdf PDFs (Noto Sans Devanagari).
//
// 1) fontkit caches each glyph by id together with the characters it was first
//    seen with. In this font the reph (र् in शर्मा, कर्म, धर्म …) and the top hook
//    of ई / ऐ are the SAME glyph. Whichever is rendered first "wins", so after a
//    name like "शर्मा" every later ई is counted as 3 characters instead of 1 (and
//    vice-versa). react-pdf then thinks the text is longer than it is and drops
//    the last letters of that line — e.g. "बाजार के पास" printed as "बाजार के प".
//    Fix: return a glyph that carries the characters of the CURRENT text.
//
// 2) ई / ऐ are shaped as two glyphs (इ/ए + hook). When a line starts with one of
//    them, react-pdf cuts the line between the two and the base letter vanishes
//    ("ईटावा" printed as "ˈटावा"). The font also has the ready-made single glyph
//    for ई / ऐ (identical shape), so we use that instead of the two pieces.
//
// Drawing is otherwise unchanged; only react-pdf's bookkeeping is corrected.

import { Font } from '@react-pdf/renderer';

const MARK_RE = /\p{M}/u;
const PRECOMPOSE = new Set([0x0908 /* ई */, 0x0910 /* ऐ */]);

const sameChars = (a = [], b = []) => a.length === b.length && a.every((c, i) => c === b[i]);

const patchFontkitFont = (font) => {
  if (!font || font.__devanagariFix || typeof font.getGlyph !== 'function') return;

  // ── 1) per-text code points ──
  const getGlyph = font.getGlyph.bind(font);
  font.getGlyph = (id, characters = []) => {
    const glyph = getGlyph(id, characters);
    if (!glyph || !Array.isArray(characters) || sameChars(glyph.codePoints, characters)) return glyph;
    const copy = Object.create(glyph); // same shape & metrics
    copy.codePoints = characters;
    copy.isMark = characters.length > 0 && characters.every(c => MARK_RE.test(String.fromCodePoint(c)));
    copy.isLigature = characters.length > 1;
    return copy;
  };

  // ── 2) single glyph for ई / ऐ ──
  if (typeof font.layout === 'function' && typeof font.glyphForCodePoint === 'function') {
    const layout = font.layout.bind(font);
    font.layout = (...args) => {
      const run = layout(...args);
      try {
        const { glyphs, positions } = run || {};
        if (!Array.isArray(glyphs) || !Array.isArray(positions)) return run;
        for (let i = 0; i < glyphs.length - 1; i += 1) {
          const base = glyphs[i];
          const hook = glyphs[i + 1];
          const cps = base?.codePoints || [];
          if (cps.length !== 1 || !PRECOMPOSE.has(cps[0])) continue;
          if (!hook || (hook.codePoints || []).length !== 0) continue;
          const whole = font.glyphForCodePoint(cps[0]);
          if (!whole || !whole.id || whole.id === base.id) continue;
          glyphs.splice(i, 2, font.getGlyph(whole.id, cps));
          const [pb, ph] = positions.splice(i, 2);
          positions.splice(i, 0, {
            ...pb,
            xAdvance: (pb?.xAdvance || 0) + (ph?.xAdvance || 0),
            yAdvance: (pb?.yAdvance || 0) + (ph?.yAdvance || 0),
          });
        }
      } catch (e) {
        // leave the run as fontkit produced it
      }
      return run;
    };
  }

  font.__devanagariFix = true;
};

const patchSource = (source) => {
  if (!source || source.__devanagariFix) return;
  source.__devanagariFix = true;
  if (source.data) patchFontkitFont(source.data);
  if (typeof source._load === 'function') {
    const load = source._load.bind(source);
    source._load = async (...args) => {
      const result = await load(...args);
      patchFontkitFont(source.data);
      return result;
    };
  }
};

/** Call before rendering a PDF (safe to call on every render). */
export const fixDevanagariGlyphs = (families) => {
  try {
    const registered = Font.getRegisteredFonts?.() || {};
    const names = families || Object.keys(registered);
    names.forEach(name => (registered[name]?.sources || []).forEach(patchSource));
  } catch (e) {
    // Never break PDF generation because of this fix.
    console.warn('[pdf] Devanagari fix not applied', e);
  }
};

export default fixDevanagariGlyphs;
