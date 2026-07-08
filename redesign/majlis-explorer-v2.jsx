/* ════════════════════════════════════════════════════════════
   MAJLIS EXPLORER v2 (design uplift) — adds ring legend +
   staggered entrance indices. Styling uplift lives in uplift.css.
   The panel lives on the right (LTR) / left (RTL) and slides in
   when a figure is clicked; it carries the full profile —
   the circle of people AND life & work. Click empty space or ✕
   to slide it away and see the whole map.
   ════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo, useEffect, useRef } = React;

  if (!document.getElementById("mx-styles")) {
    const s = document.createElement("style");
    s.id = "mx-styles";
    s.textContent = `
    .mx-stage { position: absolute; inset: 64px 0 0 0; display: grid; place-items: center; overflow: hidden; }
    .mx-net { position: relative; }
    .mx-glow { position: absolute; left: 50%; top: 50%; width: 46%; height: 46%; transform: translate(-50%,-50%); background: radial-gradient(circle, rgba(176,130,47,.16) 0%, transparent 64%); pointer-events: none; }
    .mx-node { position: absolute; transform: translate(-50%,-50%); display: flex; flex-direction: column; align-items: center; gap: 3px; width: 132px; margin-left: -66px; text-align: center; cursor: pointer; transition: transform .18s; }
    .mx-node .nl { font-family: var(--font-disp); font-weight: 600; line-height: 1.04; color: var(--ink); white-space: nowrap; background: rgba(244,236,216,.86); padding: 1px 7px; border-radius: 3px; }
    [dir=rtl] .mx-node .nl { font-family: var(--font-sans); }
    .mx-node .ny { font-family: var(--font-mono); font-size: 9px; color: var(--ink-3); background: rgba(244,236,216,.7); padding: 0 4px; border-radius: 2px; }
    .mx-node.up .mx-med-wrap { order: 3; }
    .mx-node.up .nl { order: 2; }
    .mx-node.up .ny { order: 1; }
    .mx-node:hover { transform: translate(-50%,-50%) scale(1.06); }
    .mx-node.sel { transform: translate(-50%,-50%) scale(1.1); }
    .mx-node.dim { opacity: .4; }
    .mx-med-wrap { position: relative; }
    .mx-node.sel .mx-med-wrap::after { content:""; position: absolute; inset: -6px; border-radius: 50%; border: 2px solid var(--brass); }
    .mx-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); display: flex; flex-direction: column; align-items: center; cursor: pointer; z-index: 3; }
    .mx-center.sel .mx-med-wrap::after { content:""; position: absolute; inset: -7px; border-radius: 50%; border: 2px solid var(--brass); }
    .mx-center .cn { font-family: var(--font-disp); font-size: 19px; font-weight: 700; margin-top: 9px; white-space: nowrap; background: var(--paper); padding: 2px 12px; border-radius: 4px; box-shadow: 0 0 0 1px var(--line-2); }
    .mx-center .cl { font-family: var(--font-mono); font-size: 10px; color: var(--brass-deep); margin-top: 5px; background: var(--paper); padding: 0 7px; border-radius: 3px; }

    /* the single sliding panel */
    .mx-panel { position: absolute; top: 64px; bottom: 0; right: 0; width: 392px; background: var(--card); z-index: 20; display: flex; flex-direction: column; border-left: 1px solid var(--line-2); transition: transform .36s cubic-bezier(.4,0,.2,1); box-shadow: -14px 0 50px -22px rgba(40,30,12,.5); }
    [dir=rtl] .mx-panel { right: auto; left: 0; border-left: none; border-right: 1px solid var(--line-2); box-shadow: 14px 0 50px -22px rgba(40,30,12,.5); }
    [dir=ltr] .mx-panel.closed { transform: translateX(100%); }
    [dir=rtl] .mx-panel.closed { transform: translateX(-100%); }

    /* reopen tab — shows on the panel's outer edge when closed */
    .mx-reopen { position: absolute; top: 50%; transform: translateY(-50%); z-index: 19; display: flex; align-items: center; gap: 8px; padding: 12px 9px; background: var(--card); border: 1px solid var(--line-2); cursor: pointer; color: var(--ink-2); transition: opacity .25s, transform .36s cubic-bezier(.4,0,.2,1); }
    .mx-reopen .rl { font-family: var(--font-sans); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; writing-mode: vertical-rl; }
    [dir=rtl] .mx-reopen .rl { letter-spacing: 0; font-size: 13px; }
    [dir=ltr] .mx-reopen { right: 0; border-right: none; border-radius: 7px 0 0 7px; }
    [dir=rtl] .mx-reopen { left: 0; border-left: none; border-radius: 0 7px 7px 0; }
    [dir=rtl] .mx-reopen .rl { writing-mode: vertical-rl; }
    .mx-reopen.hidden { opacity: 0; pointer-events: none; }

    .mx-phead { position: relative; padding: 22px 24px 18px; border-bottom: 1px solid var(--line-2); display: flex; gap: 14px; align-items: flex-start; }
    .mx-phead .pn { font-family: var(--font-disp); font-size: 24px; font-weight: 600; line-height: 1.02; letter-spacing: -.01em; }
    .mx-phead .pf { font-family: var(--font-serif); font-style: italic; font-size: 13px; color: var(--ink-3); margin-top: 5px; }
    [dir=rtl] .mx-phead .pf { font-style: normal; font-size: 14.5px; }
    .mx-phead .pm { font-family: var(--font-mono); font-size: 10.5px; color: var(--brass-deep); margin-top: 7px; }
    .mx-relbadge { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; font-family: var(--font-sans); font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
    [dir=rtl] .mx-relbadge { font-size: 12.5px; }
    .mx-relbadge .d { width: 7px; height: 7px; border-radius: 50%; }
    .mx-close { position: absolute; top: 16px; inset-inline-end: 16px; width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--line-2); background: var(--paper); display: grid; place-items: center; cursor: pointer; color: var(--ink-3); }
    .mx-close:hover { background: var(--inset); color: var(--ink); }

    .mx-pbody { flex: 1; overflow-y: auto; padding: 0 24px 30px; }
    .mx-pbody::-webkit-scrollbar { width: 8px; }
    .mx-pbody::-webkit-scrollbar-thumb { background: var(--line-3); border-radius: 4px; }
    .mx-sec { font-family: var(--font-sans); font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-4); padding: 20px 0 4px; }
    [dir=rtl] .mx-sec { font-size: 12px; letter-spacing: 0; }
    .mx-grp { padding: 14px 0; border-top: 1px solid var(--line); }
    .mx-grp .gl { font-family: var(--font-sans); font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 11px; }
    [dir=rtl] .mx-grp .gl { font-size: 12.5px; letter-spacing: 0; }
    .mx-chips { display: flex; flex-wrap: wrap; gap: 7px; }
    .mx-chip { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-sans); font-size: 13px; font-weight: 500; padding: 5px 11px 5px 6px; border-radius: 999px; background: var(--inset); border: 1px solid var(--line-2); color: var(--ink-2); }
    [dir=rtl] .mx-chip { font-size: 14.5px; padding: 5px 6px 5px 11px; }
    .mx-chip.link { cursor: pointer; }
    .mx-chip.link:hover { background: var(--brass-tint); border-color: var(--brass); }
    .mx-chip.plain { padding: 5px 12px; font-family: var(--font-serif); font-size: 14.5px; color: var(--ink-2); background: transparent; border-color: var(--line); }
    [dir=rtl] .mx-chip.plain { font-size: 15.5px; }
    .mx-chip .cmed { flex: 0 0 auto; }

    .mx-place { display: flex; align-items: center; gap: 10px; padding: 9px 0; }
    .mx-place .pin { width: 20px; height: 20px; flex: 0 0 auto; display: grid; place-items: center; }
    .mx-place .pin i { width: 8px; height: 8px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); }
    .mx-place .pl { font-family: var(--font-sans); font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-4); width: 78px; flex: 0 0 auto; }
    [dir=rtl] .mx-place .pl { font-size: 12px; letter-spacing: 0; width: 92px; }
    .mx-place .pv { font-family: var(--font-disp); font-size: 17px; font-weight: 500; }
    .mx-bio { font-family: var(--font-serif); font-size: 16px; line-height: 1.55; color: var(--ink-2); text-wrap: pretty; padding-top: 4px; }
    .mx-pub { display: grid; grid-template-columns: auto 1fr; gap: 12px; padding: 9px 0; border-top: 1px dotted var(--line-2); align-items: baseline; }
    .mx-pub:first-of-type { border-top: none; }
    .mx-pub .py { font-family: var(--font-mono); font-size: 10.5px; color: var(--brass-deep); white-space: nowrap; }
    .mx-pub .pt { font-family: var(--font-disp); font-size: 16px; font-weight: 500; line-height: 1.15; }

    @media (max-width: 980px) {
      .mx-panel { width: 88%; max-width: 392px; }
    }

    /* focus bar — the focal-point manager */
    .mxf { position: absolute; top: 76px; left: 50%; transform: translateX(-50%); z-index: 16; display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; background: rgba(251,246,232,.95); backdrop-filter: blur(8px); border: 1px solid var(--line-2); border-radius: 999px; padding: 6px 10px 6px 14px; box-shadow: 0 8px 26px -12px rgba(40,30,12,.34); max-width: calc(100% - 28px); }
    [dir=rtl] .mxf { padding: 6px 14px 6px 10px; }
    .mxf-lbl { font-family: var(--font-sans); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-4); white-space: nowrap; flex: 0 0 auto; }
    [dir=rtl] .mxf-lbl { letter-spacing: 0; font-size: 12px; }
    .mxf-chips { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; }
    .mxf-chip { display: inline-flex; align-items: center; gap: 7px; padding: 4px 7px 4px 9px; background: var(--card); border: 1px solid var(--line-2); border-radius: 999px; font-family: var(--font-disp); font-size: 14px; font-weight: 600; white-space: nowrap; }
    [dir=rtl] .mxf-chip { padding: 4px 9px 4px 7px; font-family: var(--font-sans); }
    .mxf-chip .x { width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; color: var(--ink-4); }
    .mxf-chip .x:hover { background: var(--rose-tint); color: var(--rose-deep); }
    .mxf-add { position: relative; display: inline-flex; }
    .mxf-addbtn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 13px; border-radius: 999px; border: 1px dashed var(--line-3); background: transparent; cursor: pointer; font-family: var(--font-sans); font-size: 12.5px; font-weight: 600; color: var(--ink-2); white-space: nowrap; }
    [dir=rtl] .mxf-addbtn { font-size: 14px; }
    .mxf-addbtn:hover { border-color: var(--brass); color: var(--brass-deep); }
    .mxf-reset { font-family: var(--font-sans); font-size: 12px; font-weight: 600; color: var(--ink-4); background: none; border: none; cursor: pointer; padding: 4px 8px; white-space: nowrap; }
    [dir=rtl] .mxf-reset { font-size: 13.5px; }
    .mxf-reset:hover { color: var(--ink); }
    @media (max-width: 760px) { .mxf-lbl { display: none; } }
    `;
    document.head.appendChild(s);
  }

  /* How-to-read-the-map legend (signature view only) —
     collapsed: the four line textures; expanded: full reasoning
     notes (tier evidence, rings, arrows, medallion colour key). */
  function RingLegend() {
    const { lang } = useKW();
    const [more, setMore] = React.useState(false);
    const L = KW2.L[lang];
    const VC = V3[lang].catName;
    const E = KW2.EDGE;
    const S = lang === "ar" ? {
      rings: "الحلقاتُ مسافةُ يقين: كلّما اقتربت الشخصية من المركز كانت الصلةُ أوثق توثيقًا.",
      arrows: "السهم إلى الداخل = مصدرٌ قرأه · السهم إلى الخارج = وريثٌ قرأه.",
      colors: "لون الميدالية = فئة الشخصية:",
      more: "كيف أُفكِّر في الخريطة؟", less: "إخفاء الشرح",
    } : {
      rings: "Rings are distance-of-certainty: the nearer a figure sits to the centre, the better documented the contact.",
      arrows: "Arrow pointing in = a source he read · arrow pointing out = an heir who read him.",
      colors: "Medallion colour = the figure's category:",
      more: "How to reason about the map", less: "Hide the notes",
    };
    const rows = [
      { c: E.direct,   d: "",    rev: false, mk: null,            t: L.tiers.direct.t,   x: L.tiers.direct.d },
      { c: E.possible, d: "8 6", rev: false, mk: null,            t: L.tiers.possible.t, x: L.tiers.possible.d },
      { c: E.past,     d: "2 6", rev: true,  mk: "url(#mx-in)",   t: L.tiers.past.t,     x: L.tiers.past.d },
      { c: E.future,   d: "2 6", rev: false, mk: "url(#mx-out)",  t: L.tiers.future.t,   x: L.tiers.future.d },
    ];
    const cats = ["influence", "patron", "peer", "successor", "world"];
    return (
      <div className={"mx-legend" + (more ? " open" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="lg-t">{L.legend}</div>
        {rows.map((r, i) => (
          <div className="lg-row" key={i}>
            <svg width="36" height="10" style={{ flex: "0 0 auto", overflow: "visible" }}>
              <line x1={r.rev ? 34 : 2} y1="5" x2={r.rev ? 8 : 28} y2="5" stroke={r.c} strokeWidth="1.8" strokeDasharray={r.d || null} markerEnd={r.mk} />
            </svg>
            <span className="lg-l">{r.t}{more && <span className="lg-d">{r.x}</span>}</span>
          </div>
        ))}
        {more && (
          <React.Fragment>
            <div className="lg-note">{S.rings}</div>
            <div className="lg-note">{S.arrows}</div>
            <div className="lg-cats">
              <span className="lg-note" style={{ borderTop: "none", paddingTop: 0, marginTop: 0, width: "100%" }}>{S.colors}</span>
              {cats.map((c) => (
                <span className="lg-cat" key={c}><span className="lg-dot" style={{ background: CAT_COLOR[c] }}></span>{VC[c]}</span>
              ))}
            </div>
          </React.Fragment>
        )}
        <button className="lg-toggle" onClick={() => setMore((v) => !v)}>{more ? S.less : S.more}</button>
      </div>
    );
  }

  function MajlisExplorer() {
    const { t, dir, lang } = useKW();
    const V = V3[lang];
    const F = window.FIG;
    const [selId, setSelId] = useState("kw");
    const [open, setOpen] = useState(false);
    const [focal, setFocal] = useState(["kw"]);
    const [addOpen, setAddOpen] = useState(false);
    const [browseOpen, setBrowseOpen] = useState(false);
    const [size, setSize] = useState(720);
    const stageRef = useRef(null);

    useEffect(() => {
      const fit = () => {
        if (!stageRef.current) return;
        const r = stageRef.current.getBoundingClientRect();
        setSize(Math.max(420, Math.min(r.width - 56, r.height - 140, 880)));
      };
      fit();
      window.addEventListener("resize", fit);
      return () => window.removeEventListener("resize", fit);
    }, []);

    const RING = { direct: ["mamun","mutasim","banumusa","kindi","hunayn","farghani","sind"],
                   possible: ["harun","shafii","hanbal","abunuwas","jahiz","charlemagne","ziryab"],
                   past: ["brahmagupta","ptolemy","diophantus","euclid"],
                   future: ["abukamil","battani","karaji","khayyam","fibonacci"] };
    const R = { direct: 0.28, possible: 0.39, textual: 0.475 };

    const nodes = useMemo(() => {
      const out = [];
      const place = (ids, r, startDeg) => ids.forEach((id, i) => {
        const a = (startDeg + i * 360 / ids.length) * Math.PI / 180;
        out.push({ id, nx: 0.5 + r * Math.cos(a), ny: 0.5 + r * Math.sin(a), tier: tierOf(id) });
      });
      place(RING.direct, R.direct, -90);
      place(RING.possible, R.possible, -64);
      const pastAng = [134, 162, 198, 226], futAng = [-44, -22, 0, 22, 44];
      RING.past.forEach((id, i) => { const a = pastAng[i] * Math.PI / 180; out.push({ id, nx: 0.5 + R.textual * Math.cos(a), ny: 0.5 + R.textual * Math.sin(a), tier: "past" }); });
      RING.future.forEach((id, i) => { const a = futAng[i] * Math.PI / 180; out.push({ id, nx: 0.5 + R.textual * Math.cos(a), ny: 0.5 + R.textual * Math.sin(a), tier: "future" }); });
      return out;
    }, []);

    const EDGE = KW2.EDGE, DASH = KW2.DASH;
    const sel = F[selId];
    const cx = size / 2, cy = size / 2;
    const NSIZE = { direct: 46, possible: 40, past: 37, future: 37 };
    const NFONT = { direct: 14, possible: 12.5, past: 12, future: 12 };

    const relTier = tierOf(selId);
    const badgeColor = relTier === "self" ? "var(--brass)" : EDGE[relTier];

    // selecting a figure opens the panel
    const pick = (id) => { setSelId(id); setOpen(true); };

    // focal-set management (the focal point can be one figure or many)
    const MAXF = 5;
    const addFocal = (id) => setFocal((cur) => (cur.includes(id) || cur.length >= MAXF) ? cur : [...cur, id]);
    const toggleFocal = (id) => setFocal((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : (cur.length >= MAXF ? cur : [...cur, id]));
    const removeFocal = (id) => setFocal((cur) => { const n = cur.filter((x) => x !== id); return n.length ? n : ["kw"]; });
    const resetFocal = () => { setFocal(["kw"]); setOpen(false); };
    const searchPick = (id) => { addFocal(id); pick(id); setAddOpen(false); };
    const isSignature = focal.length === 1 && focal[0] === "kw";

    const PeopleGroup = ({ k }) => {
      const items = sel[k] || [];
      return (
        <div className="mx-grp">
          <div className="gl">{V.props[k]}</div>
          <div className="mx-chips">
            {items.map((p, i) => {
              const label = fx(p, lang);
              if (p.id && F[p.id]) {
                const pf = F[p.id];
                return (
                  <span className="mx-chip link" key={i} onClick={() => pick(p.id)}>
                    <Medallion size={22} glyph={pf.glyph} variant={figVariant(pf.cat)} className="cmed" />
                    {fx(pf.name, lang)}
                  </span>
                );
              }
              return <span className="mx-chip plain" key={i}>{label}</span>;
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="kw mx kw-lattice" dir={dir} style={{ position: "absolute", inset: 0, background: "var(--paper)" }}>
        {/* focus bar — search + browse feed the focal point */}
        <div className="mxf">
          <span className="mxf-lbl">{V.nav.focus}</span>
          <div className="mxf-chips">
            {focal.map((id) => {
              const f = F[id];
              return (
                <span className="mxf-chip" key={id}>
                  <Medallion size={22} glyph={f.glyph} variant={figVariant(f.cat)} />
                  {fx(f.name, lang)}
                  <span className="x" onClick={() => removeFocal(id)} title={V.nav.remove}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                  </span>
                </span>
              );
            })}
            <span className="mxf-add">
              <button className="mxf-addbtn" onClick={() => setAddOpen((v) => !v)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                {V.nav.add}
              </button>
              {addOpen && <SearchPopover focal={focal} onPick={searchPick} onBrowse={() => { setAddOpen(false); setBrowseOpen(true); }} onClose={() => setAddOpen(false)} />}
            </span>
          </div>
          {!isSignature && <button className="mxf-reset" onClick={resetFocal}>{V.nav.reset}</button>}
        </div>

        {/* stage — clicking empty space closes the panel */}
        <div className="mx-stage" ref={stageRef} onClick={() => setOpen(false)}>
          {isSignature ? (
          <div className="mx-net" style={{ width: size, height: size }} onClick={(e) => e.stopPropagation()}>
            <div className="mx-glow"></div>
            <svg width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <defs>
                <marker id="mx-in" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" fill={EDGE.past} /></marker>
                <marker id="mx-out" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 1L9 5L0 9z" fill={EDGE.future} /></marker>
              </defs>
              <circle cx={cx} cy={cy} r={R.direct * size} fill="none" stroke="var(--line-2)" strokeWidth="1" />
              <circle cx={cx} cy={cy} r={R.possible * size} fill="none" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="3 7" />
              <circle cx={cx} cy={cy} r={R.textual * size} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="1 6" />
              {nodes.map((nd) => {
                const x = nd.nx * size, y = nd.ny * size;
                const dx = x - cx, dy = y - cy, len = Math.hypot(dx, dy);
                const inner = 50, outer = len - NSIZE[nd.tier] / 2 - 22;
                const x1 = cx + dx / len * inner, y1 = cy + dy / len * inner;
                const x2 = cx + dx / len * outer, y2 = cy + dy / len * outer;
                const isPast = nd.tier === "past", isFut = nd.tier === "future";
                const active = !open || selId === nd.id || selId === "kw";
                return (
                  <line key={nd.id}
                    x1={isPast ? x2 : x1} y1={isPast ? y2 : y1} x2={isPast ? x1 : x2} y2={isPast ? y1 : y2}
                    stroke={EDGE[nd.tier]} strokeOpacity={open && selId === nd.id ? 0.95 : (active ? 0.5 : 0.22)}
                    strokeWidth={open && selId === nd.id ? 2.6 : (nd.tier === "direct" ? 1.8 : 1.3)}
                    strokeDasharray={DASH[nd.tier] || null}
                    markerEnd={isPast ? "url(#mx-in)" : isFut ? "url(#mx-out)" : null} />
                );
              })}
            </svg>

            {nodes.map((nd, ndi) => {
              const f = F[nd.id];
              const isSel = open && selId === nd.id;
              const dimmed = open && selId !== "kw" && selId !== nd.id;
              const up = nd.ny < 0.46;
              return (
                <div className={"mx-node tier-" + nd.tier + (isSel ? " sel" : "") + (dimmed ? " dim" : "") + (up ? " up" : "")}
                  key={nd.id} style={{ left: nd.nx * size, top: nd.ny * size, "--i": ndi }}
                  onClick={(e) => { e.stopPropagation(); pick(nd.id); }}>
                  <span className="mx-med-wrap"><Medallion size={NSIZE[nd.tier]} glyph={f.glyph} variant={figVariant(f.cat)} /></span>
                  <span className="nl" style={{ fontSize: NFONT[nd.tier] }}>{fx(f.name, lang)}</span>
                  <span className="ny">{fx(f.life, lang)}</span>
                </div>
              );
            })}

            <div className={"mx-center" + (open && selId === "kw" ? " sel" : "")} onClick={(e) => { e.stopPropagation(); pick("kw"); }}>
              <span className="mx-med-wrap" style={{ display: "block" }}>
                <Medallion size={Math.max(82, size * 0.12)} glyph="خ" style={{ boxShadow: open && selId === "kw" ? "0 0 0 3px var(--brass), 0 0 40px -8px rgba(176,130,47,.6)" : "0 0 0 1px var(--line-2), inset 0 0 0 4px var(--card), 0 12px 36px -16px rgba(90,60,10,.5)" }} />
              </span>
              <span className="cn">{fx(F.kw.name, lang)}</span>
              <span className="cl">{fx(F.kw.life, lang)}</span>
            </div>
          </div>
          ) : (
          <div className="mx-net" style={{ width: size, height: size }} onClick={(e) => e.stopPropagation()}>
            <div className="mx-glow"></div>
            <MultiAnchorNet focal={focal} selId={selId} open={open} onPick={pick} onRemove={removeFocal} size={size} dir={dir} lang={lang} />
          </div>
          )}
          {isSignature && <RingLegend />}
          {!isSignature && <ConnectionsBanner focal={focal} lang={lang} />}
        </div>

        {/* reopen tab (when panel is closed) */}
        <button className={"mx-reopen" + (open ? " hidden" : "")} onClick={() => setOpen(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }}><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="rl">{V.lifework}</span>
        </button>

        {/* THE single sliding panel — full profile */}
        <div className={"mx-panel" + (open ? "" : " closed")}>
          <div className="mx-phead">
            <Medallion size={54} glyph={sel.glyph} variant={figVariant(sel.cat)} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="pn">{fx(sel.name, lang)}</div>
              <div className="pf">{fx(sel.full, lang)}</div>
              <div className="pm">{fx(sel.role, lang)} · {fx(sel.life, lang)}</div>
              <span className="mx-relbadge" style={{ background: relTier === "self" ? "var(--brass-tint)" : KW2.EDGE[relTier] + "22", color: relTier === "self" ? "var(--brass-deep)" : KW2.EDGE[relTier] }}>
                <span className="d" style={{ background: badgeColor }}></span>{V.rel[relTier]}
              </span>
            </div>
            <button className="mx-close" onClick={() => setOpen(false)} aria-label="close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div className="mx-pbody">
            {/* life & work */}
            <div className="mx-sec">{V.lifework}</div>
            <div className="mx-grp" style={{ borderTop: "none" }}>
              {[["born", sel.born], ["died", sel.died]].map(([k, c]) => (
                <div className="mx-place" key={k}>
                  <span className="pin"><i style={{ background: k === "born" ? "var(--verd)" : "var(--rose)" }}></i></span>
                  <span className="pl">{V.props[k]}</span>
                  <span className="pv">{fx(c, lang)}</span>
                </div>
              ))}
              <div className="mx-place" style={{ alignItems: "flex-start" }}>
                <span className="pin"><i style={{ background: "var(--brass)" }}></i></span>
                <span className="pl" style={{ paddingTop: 2 }}>{V.props.lived}</span>
                <span className="pv">{(sel.lived || []).map((c) => fx(c, lang)).join(" · ")}</span>
              </div>
            </div>
            <div className="mx-grp">
              <div className="gl">{V.props.bio}</div>
              <p className="mx-bio">{fx(sel.bio, lang)}</p>
            </div>

            {/* circle of people */}
            <div className="mx-sec">{V.people}</div>
            {["teacher", "student", "peer", "acq", "gen"].map((k) => <PeopleGroup k={k} key={k} />)}

            {/* publications */}
            <div className="mx-sec">{V.props.pubs}</div>
            <div className="mx-grp" style={{ borderTop: "none", paddingTop: 6 }}>
              {(sel.pubs || []).map((p, i) => (
                <div className="mx-pub" key={i}>
                  <span className="py">{p.y || "—"}</span>
                  <span className="pt">{fx(p, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {browseOpen && <BrowseSheet focal={focal} onToggle={toggleFocal} onClose={() => setBrowseOpen(false)} />}
      </div>
    );
  }

  window.MajlisExplorer = MajlisExplorer;
})();
