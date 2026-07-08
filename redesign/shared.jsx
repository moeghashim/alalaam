/* ════════════════════════════════════════════════════════════
   Alalaam redesign — shared React primitives + language context
   ════════════════════════════════════════════════════════════ */
const { useState, useEffect, useContext, createContext } = React;

const KWCtx = createContext(null);
function useKW() { return useContext(KWCtx); }

function KWProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("kw_lang") || "en"; } catch { return "en"; }
  });
  useEffect(() => {
    try { localStorage.setItem("kw_lang", lang); } catch {}
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const t = window.KW[lang];
  return <KWCtx.Provider value={{ lang, setLang, t, dir: t.dir }}>{children}</KWCtx.Provider>;
}

/* Language toggle — sits in the fixed top toolbar */
function LangToggle() {
  const { lang, setLang } = useKW();
  const btn = (code, label, cls) => (
    <button
      onClick={() => setLang(code)}
      style={{
        border: "none", cursor: "pointer", padding: "6px 14px",
        fontFamily: cls === "ar" ? "'Reem Kufi', serif" : "'IBM Plex Sans', sans-serif",
        fontSize: cls === "ar" ? 15 : 12.5, fontWeight: 700, lineHeight: 1,
        letterSpacing: cls === "ar" ? 0 : 0.04,
        background: lang === code ? "var(--ink)" : "transparent",
        color: lang === code ? "var(--paper)" : "var(--ink-3)",
        transition: "background .15s, color .15s",
      }}
    >{label}</button>
  );
  return (
    <div style={{
      display: "inline-flex", border: "1px solid var(--line-2)",
      borderRadius: 999, overflow: "hidden", background: "var(--card)",
    }}>
      {btn("en", "EN", "en")}
      {btn("ar", "عربي", "ar")}
    </div>
  );
}

/* Geometric medallion — a portrait stand-in, never a fabricated face */
function Medallion({ size = 56, glyph = "خ", variant = "brass", style = {} }) {
  const cls = variant === "brass" ? "" : "m-" + variant;
  return (
    <div className={"kw-medallion " + cls} style={{ width: size, height: size, ...style }}>
      <span className="kw-glyph" style={{ fontSize: size * 0.4 }}>{glyph}</span>
    </div>
  );
}

function Kicker({ children, style }) {
  return <div className="kw-kicker" style={style}>{children}</div>;
}

function Tag({ cat, label }) {
  return (
    <span className={"kw-tag cat-" + cat}>
      <span className="kw-dot"></span>{label}
    </span>
  );
}

/* category accent color (for inline use) */
const CAT_COLOR = {
  influence: "var(--lapis)", patron: "var(--brass)", peer: "var(--verd)",
  successor: "var(--rose)", world: "var(--sand)",
};
const CAT_DEEP = {
  influence: "var(--lapis-deep)", patron: "var(--brass-deep)", peer: "var(--verd-deep)",
  successor: "var(--rose-deep)", world: "var(--sand-deep)",
};
const CAT_TINT = {
  influence: "var(--lapis-tint)", patron: "var(--brass-tint)", peer: "var(--verd-tint)",
  successor: "var(--rose-tint)", world: "var(--sand-tint)",
};
const MED_VARIANT = {
  influence: "lapis", patron: "brass", peer: "verd", successor: "rose", world: "sand",
};
const CAT_ORDER = ["influence", "patron", "peer", "successor", "world"];

/* Tiny vector marks (only simple geometry) */
function StarMark({ size = 18, color = "currentColor" }) {
  // two overlaid squares → 8-point star outline; simple geometry, allowed
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <span style={{ position: "absolute", inset: 0, background: color, borderRadius: 1, transform: "rotate(0deg)" }}></span>
      <span style={{ position: "absolute", inset: 0, background: color, borderRadius: 1, transform: "rotate(45deg)" }}></span>
      <span style={{ position: "absolute", inset: "32%", background: "var(--paper)", borderRadius: "50%" }}></span>
    </span>
  );
}

Object.assign(window, {
  KWCtx, useKW, KWProvider, LangToggle, Medallion, Kicker, Tag, StarMark,
  CAT_COLOR, CAT_DEEP, CAT_TINT, MED_VARIANT, CAT_ORDER,
});
