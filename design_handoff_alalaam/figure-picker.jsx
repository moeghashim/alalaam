/* ════════════════════════════════════════════════════════════
   FIGURE PICKER — two entry points that feed the focal set:
     · SearchPopover  — type a name (EN/AR), live results
     · BrowseSheet    — navigate the whole roster, grouped,
                        multi-select with checkmarks
   ════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useRef, useEffect } = React;

  if (!document.getElementById("fp-styles")) {
    const s = document.createElement("style");
    s.id = "fp-styles";
    s.textContent = `
    /* search popover */
    .fp-pop { position: absolute; top: calc(100% + 8px); inset-inline-start: 0; z-index: 60; width: 320px; background: var(--card); border: 1px solid var(--line-2); border-radius: 8px; box-shadow: 0 18px 50px -16px rgba(40,30,12,.45); overflow: hidden; }
    .fp-search { display: flex; align-items: center; gap: 9px; padding: 11px 14px; border-bottom: 1px solid var(--line-2); }
    .fp-search input { flex: 1; border: none; background: transparent; outline: none; font-family: var(--font-sans); font-size: 14px; color: var(--ink); }
    [dir=rtl] .fp-search input { font-size: 15px; }
    .fp-search input::placeholder { color: var(--ink-4); }
    .fp-search svg { color: var(--ink-4); flex: 0 0 auto; }
    .fp-results { max-height: 340px; overflow-y: auto; padding: 5px; }
    .fp-results::-webkit-scrollbar { width: 7px; }
    .fp-results::-webkit-scrollbar-thumb { background: var(--line-3); border-radius: 4px; }
    .fp-row { display: flex; align-items: center; gap: 11px; padding: 8px 10px; border-radius: 5px; cursor: pointer; }
    .fp-row:hover { background: var(--inset); }
    .fp-row .rn { font-family: var(--font-disp); font-size: 16px; font-weight: 500; line-height: 1.1; }
    .fp-row .rr { font-family: var(--font-mono); font-size: 9.5px; color: var(--ink-4); margin-top: 2px; }
    .fp-row .rcheck { margin-inline-start: auto; color: var(--brass); flex: 0 0 auto; opacity: 0; }
    .fp-row.on .rcheck { opacity: 1; }
    .fp-row.on { background: var(--brass-tint); }
    .fp-empty { padding: 22px 14px; text-align: center; font-family: var(--font-serif); font-style: italic; color: var(--ink-4); }
    [dir=rtl] .fp-empty { font-style: normal; }
    .fp-foot { padding: 9px 12px; border-top: 1px solid var(--line-2); display: flex; justify-content: space-between; align-items: center; background: var(--inset); }
    .fp-link { font-family: var(--font-sans); font-size: 12px; font-weight: 600; color: var(--brass-deep); cursor: pointer; background: none; border: none; }
    [dir=rtl] .fp-link { font-size: 13.5px; }

    /* browse sheet */
    .fp-scrim { position: fixed; inset: 0; z-index: 200; background: rgba(20,14,6,.42); backdrop-filter: blur(3px); display: grid; place-items: center; padding: 40px; }
    .fp-sheet { width: min(940px, 96vw); max-height: 86vh; background: var(--paper); border: 1px solid var(--line-2); border-radius: 10px; box-shadow: 0 30px 80px -24px rgba(20,14,6,.6); display: flex; flex-direction: column; overflow: hidden; }
    .fp-sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 26px; border-bottom: 1px solid var(--line-2); background: var(--card); }
    .fp-sheet-head .sh-t { font-family: var(--font-disp); font-size: 23px; font-weight: 600; letter-spacing: -.01em; }
    .fp-sheet-head .sh-s { font-family: var(--font-serif); font-style: italic; font-size: 13.5px; color: var(--ink-3); margin-top: 3px; }
    [dir=rtl] .fp-sheet-head .sh-s { font-style: normal; font-size: 15px; }
    .fp-sheet-body { flex: 1; overflow-y: auto; padding: 8px 26px 26px; }
    .fp-cat { padding-top: 22px; }
    .fp-cat-h { font-family: var(--font-sans); font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-4); padding-bottom: 12px; border-bottom: 1px solid var(--line-2); margin-bottom: 14px; }
    [dir=rtl] .fp-cat-h { font-size: 12.5px; letter-spacing: 0; }
    .fp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 10px; }
    .fp-card { position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--card); border: 1px solid var(--line-2); border-radius: 7px; cursor: pointer; text-align: start; transition: border-color .15s, background .15s; }
    .fp-card:hover { border-color: var(--brass); }
    .fp-card.on { background: var(--brass-tint); border-color: var(--brass); }
    .fp-card .cn { font-family: var(--font-disp); font-size: 16.5px; font-weight: 600; line-height: 1.05; }
    .fp-card .cl { font-family: var(--font-mono); font-size: 9.5px; color: var(--ink-4); margin-top: 3px; }
    .fp-card .ck { position: absolute; top: 9px; inset-inline-end: 9px; width: 18px; height: 18px; border-radius: 50%; background: var(--brass); color: #fff; display: grid; place-items: center; opacity: 0; transform: scale(.6); transition: .15s; }
    .fp-card.on .ck { opacity: 1; transform: scale(1); }
    .fp-sheet-foot { display: flex; align-items: center; justify-content: space-between; padding: 16px 26px; border-top: 1px solid var(--line-2); background: var(--card); }
    .fp-count { font-family: var(--font-serif); font-style: italic; font-size: 15px; color: var(--ink-3); }
    [dir=rtl] .fp-count { font-style: normal; }
    `;
    document.head.appendChild(s);
  }

  const IconSearch = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>);
  const IconCheck = ({ s = 14 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>);

  // Search popover — onPick(id) adds, focal = current set (for checkmarks), onBrowse opens sheet
  function SearchPopover({ focal, onPick, onBrowse, onClose }) {
    const { lang } = useKW();
    const V = V3[lang].nav;
    const F = window.FIG;
    const [q, setQ] = useState("");
    const inputRef = useRef(null);
    const popRef = useRef(null);
    useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
    useEffect(() => {
      const h = (e) => { if (popRef.current && !popRef.current.contains(e.target)) onClose(); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, []);
    const results = window.figMatches(q);
    return (
      <div className="fp-pop" ref={popRef}>
        <div className="fp-search">
          <IconSearch />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={V.searchPh} />
        </div>
        <div className="fp-results">
          {results.length === 0 && <div className="fp-empty">{V.noResults}</div>}
          {results.map((id) => {
            const f = F[id]; const on = focal.includes(id);
            return (
              <div className={"fp-row" + (on ? " on" : "")} key={id} onClick={() => onPick(id)}>
                <Medallion size={30} glyph={f.glyph} variant={figVariant(f.cat)} />
                <div style={{ minWidth: 0 }}>
                  <div className="rn">{fx(f.name, lang)}</div>
                  <div className="rr">{fx(f.life, lang)}</div>
                </div>
                <span className="rcheck"><IconCheck /></span>
              </div>
            );
          })}
        </div>
        <div className="fp-foot">
          <button className="fp-link" onClick={onBrowse}>{V.browse} →</button>
        </div>
      </div>
    );
  }

  // Browse sheet — full roster grouped by category, multi-select toggles
  function BrowseSheet({ focal, onToggle, onClose }) {
    const { lang } = useKW();
    const V = V3[lang].nav;
    const VC = V3[lang].catName;
    const F = window.FIG, ORDER = window.FIG_ORDER;
    const byCat = {};
    window.CAT_BROWSE.forEach((c) => (byCat[c] = []));
    ORDER.forEach((id) => { const c = F[id].cat; (byCat[c] || (byCat[c] = [])).push(id); });
    return (
      <div className="fp-scrim" onClick={onClose}>
        <div className="fp-sheet" onClick={(e) => e.stopPropagation()} dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="fp-sheet-head">
            <div>
              <div className="sh-t">{V.browse}</div>
              <div className="sh-s">{V.pickToFocus}</div>
            </div>
            <LangSafeClose onClose={onClose} />
          </div>
          <div className="fp-sheet-body">
            {window.CAT_BROWSE.map((c) => (byCat[c] && byCat[c].length ? (
              <div className="fp-cat" key={c}>
                <div className="fp-cat-h">{VC[c]}</div>
                <div className="fp-grid">
                  {byCat[c].map((id) => {
                    const f = F[id]; const on = focal.includes(id);
                    return (
                      <button className={"fp-card" + (on ? " on" : "")} key={id} onClick={() => onToggle(id)}>
                        <Medallion size={40} glyph={f.glyph} variant={figVariant(f.cat)} />
                        <span style={{ minWidth: 0 }}>
                          <span className="cn" style={{ display: "block" }}>{fx(f.name, lang)}</span>
                          <span className="cl">{fx(f.life, lang)}</span>
                        </span>
                        <span className="ck"><IconCheck s={11} /></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null))}
          </div>
          <div className="fp-sheet-foot">
            <span className="fp-count">{focal.length} {V.focal.toLowerCase ? V.focal.toLowerCase() : V.focal}</span>
            <button className="kw-btn primary" onClick={onClose}>{V.done}</button>
          </div>
        </div>
      </div>
    );
  }

  function LangSafeClose({ onClose }) {
    return (
      <button onClick={onClose} aria-label="close" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--line-2)", background: "var(--paper)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--ink-3)" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
      </button>
    );
  }

  window.SearchPopover = SearchPopover;
  window.BrowseSheet = BrowseSheet;
})();
