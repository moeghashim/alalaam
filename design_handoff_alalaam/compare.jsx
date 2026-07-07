/* ════════════════════════════════════════════════════════════
   COMPARE — two figures, property by property, with a
   "how they connect" reading derived from the data.
   ════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo } = React;

  if (!document.getElementById("cmp-styles")) {
    const s = document.createElement("style");
    s.id = "cmp-styles";
    s.textContent = `
    .cmp { position: absolute; inset: 64px 0 0 0; overflow-y: auto; background: var(--paper); }
    .cmp-inner { max-width: 1180px; margin: 0 auto; padding: 30px 40px 80px; }

    .cmp-pickers { display: grid; grid-template-columns: 1fr 96px 1fr; gap: 0; align-items: stretch; margin-bottom: 22px; }
    .cmp-vs { display: grid; place-items: center; font-family: var(--font-serif); font-style: italic; font-size: 15px; color: var(--ink-4); }
    [dir=rtl] .cmp-vs { font-style: normal; }
    .cmp-slot { position: relative; }
    .cmp-slotbtn { width: 100%; display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: var(--card); border: 1px solid var(--line-2); border-radius: 5px; cursor: pointer; text-align: start; }
    .cmp-slotbtn:hover { border-color: var(--brass); }
    .cmp-slotbtn .car { margin-inline-start: auto; color: var(--ink-4); flex: 0 0 auto; }
    .cmp-slotbtn .sn { font-family: var(--font-disp); font-size: 22px; font-weight: 600; line-height: 1.05; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .cmp-slotbtn .sl { font-family: var(--font-mono); font-size: 10.5px; color: var(--ink-4); margin-top: 5px; }
    .cmp-slotbtn > span { min-width: 0; flex: 1 1 auto; }
    .cmp-slotlbl { font-family: var(--font-sans); font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 8px; }
    [dir=rtl] .cmp-slotlbl { font-size: 12.5px; letter-spacing: 0; }

    .cmp-menu { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 40; background: var(--card); border: 1px solid var(--line-2); border-radius: 6px; box-shadow: 0 16px 44px -14px rgba(40,30,12,.4); max-height: 60vh; overflow-y: auto; padding: 6px; }
    .cmp-opt { display: flex; align-items: center; gap: 11px; padding: 8px 10px; border-radius: 4px; cursor: pointer; }
    .cmp-opt:hover { background: var(--inset); }
    .cmp-opt .on { font-family: var(--font-disp); font-size: 16px; font-weight: 500; white-space: nowrap; }
    .cmp-opt .oy { font-family: var(--font-mono); font-size: 9.5px; color: var(--ink-4); margin-inline-start: auto; }

    .cmp-connect { background: var(--card); border: 1px solid var(--line-2); border-radius: 6px; padding: 18px 22px; margin-bottom: 26px; }
    .cmp-connect .ch { font-family: var(--font-sans); font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 12px; }
    [dir=rtl] .cmp-connect .ch { font-size: 12.5px; letter-spacing: 0; }
    .cmp-facts { display: flex; flex-wrap: wrap; gap: 10px; }
    .cmp-fact { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-serif); font-size: 15.5px; color: var(--ink); padding: 7px 14px; border-radius: 999px; background: var(--inset); border: 1px solid var(--line-2); }
    .cmp-fact.hot { background: var(--brass-tint); border-color: var(--brass); color: var(--brass-deep); }
    .cmp-fact .fi { width: 9px; height: 9px; border-radius: 50%; background: currentColor; opacity: .8; }

    .cmp-table { border: 1px solid var(--line-2); border-radius: 6px; overflow: hidden; background: var(--card); }
    .cmp-prow { display: grid; grid-template-columns: 1fr 168px 1fr; border-top: 1px solid var(--line-2); }
    .cmp-prow:first-child { border-top: none; }
    .cmp-plabel { display: grid; place-items: center; text-align: center; padding: 16px 8px; background: var(--inset); font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
    [dir=rtl] .cmp-plabel { font-size: 13px; letter-spacing: 0; }
    .cmp-cell { padding: 16px 22px; min-width: 0; }
    .cmp-cell.a { text-align: end; }
    .cmp-cellchips { display: flex; flex-wrap: wrap; gap: 6px; }
    .cmp-cell.a .cmp-cellchips { justify-content: flex-end; }
    .cmp-v { font-family: var(--font-disp); font-size: 16.5px; font-weight: 500; line-height: 1.3; }
    .cmp-vchip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-sans); font-size: 13px; font-weight: 500; padding: 4px 11px; border-radius: 999px; background: var(--inset); border: 1px solid var(--line-2); color: var(--ink-2); }
    [dir=rtl] .cmp-vchip { font-size: 14.5px; }
    .cmp-vchip.match { background: var(--brass-tint); border-color: var(--brass); color: var(--brass-deep); font-weight: 600; }
    .cmp-vchip .vd { width: 6px; height: 6px; border-radius: 50%; background: var(--brass); }
    .cmp-bio { font-family: var(--font-serif); font-size: 14.5px; line-height: 1.5; color: var(--ink-2); text-wrap: pretty; }
    .cmp-muted { color: var(--ink-4); font-style: italic; }
    [dir=rtl] .cmp-muted { font-style: normal; }
    .cmp-pubitem { font-family: var(--font-disp); font-size: 14.5px; font-weight: 500; line-height: 1.3; }
    .cmp-pubitem .y { font-family: var(--font-mono); font-size: 10px; color: var(--brass-deep); margin-inline-start: 6px; }
    `;
    document.head.appendChild(s);
  }

  function Caret() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="car"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }

  function CompareView() {
    const { dir, lang } = useKW();
    const V = V3[lang];
    const F = window.FIG;
    const ORDER = window.FIG_ORDER;
    const [a, setA] = useState("kw");
    const [b, setB] = useState("kindi");
    const [openMenu, setOpenMenu] = useState(null);

    const FA = F[a], FB = F[b];

    const Slot = ({ which, id, label }) => {
      const f = F[id];
      return (
        <div className="cmp-slot">
          <div className="cmp-slotlbl">{label}</div>
          <button className="cmp-slotbtn" onClick={() => setOpenMenu(openMenu === which ? null : which)}>
            <Medallion size={44} glyph={f.glyph} variant={figVariant(f.cat)} />
            <span style={{ minWidth: 0 }}>
              <span className="sn" style={{ display: "block" }}>{fx(f.name, lang)}</span>
              <span className="sl">{fx(f.life, lang)}</span>
            </span>
            <Caret />
          </button>
          {openMenu === which && (
            <div className="cmp-menu">
              {ORDER.map((oid) => {
                const of = F[oid];
                return (
                  <div className="cmp-opt" key={oid} onClick={() => { which === "a" ? setA(oid) : setB(oid); setOpenMenu(null); }}>
                    <Medallion size={28} glyph={of.glyph} variant={figVariant(of.cat)} />
                    <span className="on">{fx(of.name, lang)}</span>
                    <span className="oy">{fx(of.life, lang)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    // ── connections ───────────────────────────────────────────
    const facts = useMemo(() => {
      const out = [];
      if (a === b) return out;
      const ya = KW2.YEARS[a], yb = KW2.YEARS[b];
      if (ya && yb) {
        const lo = Math.max(ya[0], yb[0]), hi = Math.min(ya[1], yb[1]);
        if (hi > lo) out.push({ hot: true, text: V.overlap(KW2.toDigits(lo, lang), KW2.toDigits(hi, lang)) + " · " + V.couldMeet });
        else out.push({ hot: false, text: V.overlapNo + " · " + V.onlyBooks });
      }
      const idsA = peopleIds(FA), idsB = peopleIds(FB);
      if (idsA.has(b) || idsB.has(a)) out.push({ hot: true, text: V.directRel });
      const cityA = cityNames(FA), cityB = cityNames(FB);
      [...cityA].filter((c) => cityB.has(c)).forEach((c) => {
        const city = (FA.lived.concat([FA.born, FA.died])).find((x) => x.en === c);
        out.push({ hot: true, text: V.sharedCity + ": " + (city ? fx(city, lang) : c) });
      });
      const genA = (FA.gen || []).some((p) => p.id === b), genB = (FB.gen || []).some((p) => p.id === a);
      if ((genA || genB) && !out.some((o) => o.text === V.directRel)) out.push({ hot: false, text: V.sameGen });
      if (!out.some((o) => o.hot)) out.push({ hot: false, text: V.noLink });
      return out;
    }, [a, b, lang]);

    // shared id / city sets for highlighting
    const idsB = peopleIds(FB), idsA = peopleIds(FA);
    const cityB = cityNames(FB), cityA = cityNames(FA);

    const PeopleCell = ({ f, side, k, otherIds, otherId }) => (
      <div className={"cmp-cell " + side}>
        <div className="cmp-cellchips">
          {(f[k] || []).map((p, i) => {
            const match = p.id && (otherIds.has(p.id) || p.id === otherId);
            const isEmpty = fx(p, lang) === "—";
            if (isEmpty) return <span className="cmp-muted cmp-v" key={i}>{V.noneRecorded}</span>;
            return (
              <span className={"cmp-vchip" + (match ? " match" : "")} key={i}>
                {match && <span className="vd"></span>}{fx(p, lang)}
              </span>
            );
          })}
        </div>
      </div>
    );

    const CityCell = ({ f, side, k, otherCities }) => {
      const cells = k === "lived" ? (f.lived || []) : [f[k]];
      return (
        <div className={"cmp-cell " + side}>
          <div className="cmp-cellchips">
            {cells.map((c, i) => {
              const match = c && otherCities.has(c.en);
              return <span className={"cmp-vchip" + (match ? " match" : "")} key={i}>{match && <span className="vd"></span>}{fx(c, lang)}</span>;
            })}
          </div>
        </div>
      );
    };

    const Row = ({ k, children }) => (
      <div className="cmp-prow">
        {children[0]}
        <div className="cmp-plabel">{V.props[k]}</div>
        {children[1]}
      </div>
    );

    return (
      <div className="kw cmp kw-lattice" dir={dir}>
        <div className="cmp-inner">
          <div className="cmp-pickers">
            <Slot which="a" id={a} label={V.first} />
            <div className="cmp-vs">{V.vs}</div>
            <Slot which="b" id={b} label={V.second} />
          </div>

          <div className="cmp-connect">
            <div className="ch">{V.connect}</div>
            <div className="cmp-facts">
              {facts.map((f, i) => (
                <span className={"cmp-fact" + (f.hot ? " hot" : "")} key={i}><span className="fi"></span>{f.text}</span>
              ))}
            </div>
          </div>

          <div className="cmp-table">
            {["teacher", "student", "peer", "acq", "gen"].map((k) => (
              <Row k={k} key={k}>
                <PeopleCell f={FA} side="a" k={k} otherIds={idsB} otherId={b} />
                <PeopleCell f={FB} side="b" k={k} otherIds={idsA} otherId={a} />
              </Row>
            ))}
            {["born", "died", "lived"].map((k) => (
              <Row k={k} key={k}>
                <CityCell f={FA} side="a" k={k} otherCities={cityB} />
                <CityCell f={FB} side="b" k={k} otherCities={cityA} />
              </Row>
            ))}
            <Row k="bio">
              <div className="cmp-cell a"><p className="cmp-bio">{fx(FA.bio, lang)}</p></div>
              <div className="cmp-cell b"><p className="cmp-bio">{fx(FB.bio, lang)}</p></div>
            </Row>
            <Row k="pubs">
              <div className="cmp-cell a">
                {(FA.pubs || []).map((p, i) => <div className="cmp-pubitem" key={i}>{fx(p, lang)}{p.y && <span className="y">{p.y}</span>}</div>)}
              </div>
              <div className="cmp-cell b">
                {(FB.pubs || []).map((p, i) => <div className="cmp-pubitem" key={i}>{fx(p, lang)}{p.y && <span className="y">{p.y}</span>}</div>)}
              </div>
            </Row>
          </div>
        </div>
      </div>
    );
  }

  window.CompareView = CompareView;
})();
