/**
 * dataLayer Live View
 * Version: 0.9
 * A lightweight DevTools script for real-time monitoring and debugging of dataLayer pushes.
 *
 * @author  dgizdevans
 * @license MIT
 * @see     https://github.com/dgizdevans/datalayer-live-view
 */
(() => {
  // ==================== CONFIG (editable) ====================

  const DL_NAME = 'dataLayer';
  const SHOW_GTAG = true;    // false — hide gtag() calls
  const SHOW_SOURCE = false; // true — show the source of each push
  const FRAMES = 3;          // number of stack lines shown when SHOW_SOURCE = true

  const COLORS = {           // bg — background color, fg — text color
    event: { bg: 'green',   fg: 'white' },
    gtm:   { bg: '#dbdbdb', fg: 'white' },
    gtag:  { bg: '#9e9e9e', fg: 'white' },
    data:  { bg: '#ffd54f', fg: 'black' }
  };

  // ==================== CORE (do not edit) ====================

  const dl = window[DL_NAME];
  if (!dl || dl.__pushOvr) return;

  const BASE_STYLE = 'font-weight:bold;font-size:1.2em;padding:.1em 2em';
  const st = Object.fromEntries(
    Object.entries(COLORS).map(([k, c]) => [k, `color:${c.fg};background:${c.bg};${BASE_STYLE}`])
  );

  const clone = (v, path = new WeakSet()) => {
    if (typeof v === 'function') return '[function]';
    if (v === null || typeof v !== 'object') return v;
    if (v instanceof Element) {
      const cls = typeof v.className === 'string' && v.className.trim()
        ? '.' + v.className.trim().split(/\s+/).join('.') : '';
      return `<${v.tagName.toLowerCase()}${v.id ? '#' + v.id : ''}${cls}>`;
    }
    if (v instanceof Date) return new Date(v.getTime());
    if (path.has(v)) return '[circular]';
    path.add(v);
    const out = Array.isArray(v) ? [] : {};
    for (const k of Object.keys(v)) {
      try { out[k] = clone(v[k], path); } catch (e) { out[k] = '[unreadable]'; }
    }
    path.delete(v);
    return out;
  };

  const getSource = () =>
    (new Error().stack || '').split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('at ') && !l.includes('datalayer-live-view.js'))
      .slice(0, FRAMES)
      .map(l => l.slice(3))
      .join('\n   ');

  const print = (label, style, data, src) =>
    src ? console.log(`%c${label}`, style, data, `\n↳ ${src}`)
        : console.log(`%c${label}`, style, data);

  const log = (entry, src) => {
    if (Object.prototype.toString.call(entry) === '[object Arguments]') {
      if (!SHOW_GTAG) return;
      const a = Array.from(entry);
      const sub = a[1] !== undefined && typeof a[1] !== 'object' ? ` | ${a[1]}` : '';
      return print(`GTAG ${a[0]}${sub}`, st.gtag, clone(a), src);
    }
    if (entry && typeof entry === 'object' && 'event' in entry) {
      const ev = String(entry.event);
      return print(`EVENT | ${ev}`, ev.startsWith('gtm.') ? st.gtm : st.event, clone(entry), src);
    }
    print('DATA', st.data, clone(entry), src);
  };

  console.groupCollapsed(`${DL_NAME}: ${dl.length} entries before interception`);
  dl.forEach(e => log(e));
  console.groupEnd();

  const orig = dl.push;
  dl.__pushOvr = orig;
  dl.push = function (...args) {
    const src = SHOW_SOURCE ? getSource() : '';
    args.forEach(e => log(e, src));
    return orig.apply(this, args);
  };

  const gtm = window.google_tag_manager || {};
  return Object.keys(gtm).filter(k => /^(GTM|G|AW|DC)-/.test(k)).join(' ');
})();
//# sourceURL=datalayer-live-view.js