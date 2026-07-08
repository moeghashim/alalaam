/* ════════════════════════════════════════════════════════════
   MULTI-ANCHOR NET — when 2+ figures are the focal point.
   Focal figures become anchors; people who sit in 2+ of their
   circles gather in the SHARED centre (the interesting part).
   Each figure's own unique circle is summarised as a "+N" badge
   on the anchor (click to open its full profile). Direct
   figure-to-figure links are drawn bold. A single focal figure
   renders as an ego-network of its whole circle.
   ════════════════════════════════════════════════════════════ */
(function () {
  const { useMemo } = React;

  if (!document.getElementById("mm-styles")) {
    const s = document.createElement("style");
    s.id = "mm-styles";
    s.textContent = `
    .mm-node { position: absolute; transform: translate(-50%,-50%); display: flex; flex-direction: column; align-items: center; gap: 3px; width: 150px; margin-left: -75px; text-align: center; cursor: pointer; transition: transform .16s; }
    .mm-node:hover { transform: translate(-50%,-50%) scale(1.06); }
    .mm-node.sel { transform: translate(-50%,-50%) scale(1.1); }
    .mm-node .nl { font-family: var(--font-disp); font-weight: 600; line-height: 1.04; color: var(--ink); white-space: nowrap; background: rgba(244,236,216,.86); padding: 1px 7px; border-radius: 3px; font-size: 12px; }
    [dir=rtl] .mm-node .nl { font-family: var(--font-sans); }
    .mm-node .ny { font-family: var(--font-mono); font-size: 9px; color: var(--ink-3); background: rgba(244,236,216,.7); padding: 0 4px; border-radius: 2px; }
    .mm-node.up .mm-w { order: 3; } .mm-node.up .nl { order: 2; } .mm-node.up .ny { order: 1; } .mm-node.up .mm-more { order: 0; }
    .mm-w { position: relative; }
    .mm-node.sel .mm-w::after { content:""; position:absolute; inset:-6px; border-radius:50%; border:2px solid var(--brass); }
    .mm-node.anchor .nl { font-family: var(--font-disp); font-size: 17px; font-weight: 700; padding: 2px 11px; box-shadow: 0 0 0 1px var(--line-2); border-radius: 4px; background: var(--paper); }
    [dir=rtl] .mm-node.anchor .nl { font-family: var(--font-sans); }
    .mm-more { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-sans); font-size: 10.5px; font-weight: 700; color: var(--ink-3); background: var(--inset); border: 1px solid var(--line-2); border-radius: 999px; padding: 2px 10px; margin-top: 3px; white-space: nowrap; }
    [dir=rtl] .mm-more { font-size: 12px; }
    .mm-node.anchor:hover .mm-more { border-color: var(--brass); color: var(--brass-deep); }
    .mm-rmv { position: absolute; top: -7px; inset-inline-end: 8px; width: 20px; height: 20px; border-radius: 50%; background: var(--paper); border: 1px solid var(--line-2); color: var(--ink-3); display: grid; place-items: center; cursor: pointer; opacity: 0; transition: opacity .15s; z-index: 4; }
    .mm-node.anchor:hover .mm-rmv { opacity: 1; }
    .mm-rmv:hover { background: var(--rose-tint); border-color: var(--rose); color: var(--rose-deep); }
    .mm-zone { position: absolute; transform: translate(-50%,-50%); font-family: var(--font-sans); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-4); background: var(--paper); padding: 3px 12px; border: 1px solid var(--line-2); border-radius: 999px; white-space: nowrap; pointer-events: none; }
    [dir=rtl] .mm-zone { letter-spacing: 0; font-size: 12px; }

    .mm-conn { position: absolute; inset-inline: 0; bottom: 18px; display: flex; justify-content: center; pointer-events: none; z-index: 18; padding: 0 20px; }
    .mm-conn-card { pointer-events: auto; max-width: min(780px, 94%); background: rgba(251,246,232,.95); backdrop-filter: blur(8px); border: 1px solid var(--line-2); border-radius: 10px; box-shadow: 0 14px 40px -16px rgba(40,30,12,.42); padding: 13px 18px; }
    .mm-conn-h { font-family: var(--font-sans); font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 9px; }
    [dir=rtl] .mm-conn-h { letter-spacing: 0; font-size: 12px; }
    .mm-conn-rows { display: flex; flex-direction: column; gap: 7px; max-height: 150px; overflow-y: auto; }
    .mm-pair { display: flex; align-items: baseline; gap: 9px; flex-wrap: wrap; }
    .mm-pair .pp { font-family: var(--font-disp); font-size: 14.5px; font-weight: 600; white-space: nowrap; }
    .mm-pair .pp .x { color: var(--ink-4); font-weight: 400; margin: 0 5px; }
    .mm-facts { display: flex; flex-wrap: wrap; gap: 6px; }
    .mm-fact { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-serif); font-size: 13px; color: var(--ink-2); padding: 2px 10px; border-radius: 999px; background: var(--inset); border: 1px solid var(--line-2); }
    [dir=rtl] .mm-fact { font-size: 14px; }
    .mm-fact.hot { background: var(--brass-tint); border-color: var(--brass); color: var(--brass-deep); }
    .mm-fact .fd { width: 7px; height: 7px; border-radius: 50%; background: currentColor; opacity: .75; }
    .mm-hint { pointer-events: auto; font-family: var(--font-serif); font-style: italic; font-size: 14px; color: var(--ink-3); background: rgba(251,246,232,.9); padding: 8px 18px; border: 1px solid var(--line-2); border-radius: 999px; }
    [dir=rtl] .mm-hint { font-style: normal; font-size: 15px; }
    `;
    document.head.appendChild(s);
  }

  const CAT_HEX = { self: "#B0822F", influence: "#335E9E", patron: "#B0822F", peer: "#3C7E6E", successor: "#A14A60", world: "#8A7A55" };
  const RmX = () => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>);

  function MultiAnchorNet({ focal, selId, open, onPick, onRemove, size, dir, lang }) {
    const F = window.FIG;
    const cx = size / 2, cy = size / 2;
    const N = focal.length;

    const layout = useMemo(() => {
      const anchors = [], nodes = [], links = [];
      // ── EGO (one focal figure): its whole circle radially ──────
      if (N === 1) {
        const id = focal[0], f = F[id];
        anchors.push({ id, x: cx, y: cy, more: 0 });
        const order = ["teacher", "peer", "acq", "gen", "student"];
        const seen = new Set([id]); const seq = [];
        order.forEach((k) => (f[k] || []).forEach((p) => { if (p.id && F[p.id] && !seen.has(p.id)) { seen.add(p.id); seq.push(p.id); } }));
        const R = size * 0.34;
        seq.forEach((nid, i) => {
          const a = (-90 + (i + 0.5) * 360 / Math.max(seq.length, 1)) * Math.PI / 180;
          const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
          nodes.push({ id: nid, x, y });
          links.push({ x1: cx, y1: cy, x2: x, y2: y, color: CAT_HEX[F[nid].cat], w: 1.3, op: 0.42 });
        });
        return { anchors, nodes, links, sharedCount: 0, cyc: cy };
      }
      // ── MULTI (2+ focal): anchors + shared centre + "+N" badges ─
      const RA = size * (N === 2 ? 0.30 : 0.33);
      const cyc = N >= 3 ? cy - size * 0.05 : cy;
      const apos = focal.map((id, i) => {
        const deg = N === 2 ? (i === 0 ? 180 : 0) : (-90 + i * 360 / N);
        const a = deg * Math.PI / 180;
        return { id, x: cx + RA * Math.cos(a), y: cyc + RA * Math.sin(a) };
      });
      // direct figure-to-figure links
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        if (directLinked(focal[i], focal[j])) links.push({ x1: apos[i].x, y1: apos[i].y, x2: apos[j].x, y2: apos[j].y, color: "#8C6620", w: 2.4, op: 0.7 });
      }
      // classify neighbours
      const focalSet = new Set(focal);
      const uniqueCount = {}; focal.forEach((id) => (uniqueCount[id] = 0));
      const shared = [];
      window.FIG_ORDER.forEach((oid) => {
        if (focalSet.has(oid)) return;
        const conn = apos.filter((p) => directLinked(p.id, oid));
        if (conn.length >= 2) shared.push({ id: oid, anchors: conn });
        else if (conn.length === 1) uniqueCount[conn[0].id] += 1;
      });
      // shared nodes near centre (compact column for 2; clustered for 3+)
      const sc = shared.length;
      shared.forEach((sn, i) => {
        let x, y;
        if (N === 2) {
          const sp = sc > 1 ? Math.min(60, (size * 0.5) / (sc - 1)) : 0;
          x = cx; y = cy + (i - (sc - 1) / 2) * sp;
        } else {
          const ax = sn.anchors.reduce((s, p) => s + p.x, 0) / sn.anchors.length;
          const ay = sn.anchors.reduce((s, p) => s + p.y, 0) / sn.anchors.length;
          x = cx + (ax - cx) * 0.5 + Math.cos(i * 2.4) * 42;
          y = cyc + (ay - cyc) * 0.5 + Math.sin(i * 2.4) * 42;
        }
        nodes.push({ id: sn.id, x, y, shared: true });
        sn.anchors.forEach((p) => links.push({ x1: p.x, y1: p.y, x2: x, y2: y, color: "#9A7B3A", w: 1.5, op: 0.5 }));
      });
      apos.forEach((p) => anchors.push({ id: p.id, x: p.x, y: p.y, more: uniqueCount[p.id] }));
      return { anchors, nodes, links, sharedCount: shared.length, cyc };
    }, [focal.join(","), size]);

    const renderNode = (nd, isAnchor) => {
      const f = F[nd.id];
      const isSel = open && selId === nd.id;
      const up = nd.y < cy - size * 0.03;
      const asize = isAnchor ? (N === 1 ? Math.max(86, size * 0.13) : (N === 2 ? 66 : 54)) : (nd.shared ? 40 : 36);
      return (
        <div className={"mm-node" + (isAnchor ? " anchor" : "") + (isSel ? " sel" : "") + (up ? " up" : "")}
          key={(isAnchor ? "a-" : "n-") + nd.id} style={{ left: nd.x, top: nd.y }}
          onClick={(e) => { e.stopPropagation(); onPick(nd.id); }}>
          {isAnchor && N > 1 && (
            <span className="mm-rmv" onClick={(e) => { e.stopPropagation(); onRemove(nd.id); }} title="remove"><RmX /></span>
          )}
          <span className="mm-w">
            <Medallion size={asize} glyph={f.glyph} variant={figVariant(f.cat)}
              style={isAnchor ? { boxShadow: "0 0 0 1px var(--line-2), inset 0 0 0 4px var(--card), 0 10px 30px -14px rgba(90,60,10,.5)" } : {}} />
          </span>
          <span className="nl">{fx(f.name, lang)}</span>
          {!nd.shared && <span className="ny">{fx(f.life, lang)}</span>}
          {isAnchor && nd.more > 0 && <span className="mm-more">{V3[lang].nav.more(nd.more)}</span>}
        </div>
      );
    };

    return (
      <React.Fragment>
        <svg width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {N > 1 && layout.sharedCount > 0 && <circle cx={cx} cy={layout.cyc} r={size * 0.17} fill="none" stroke="var(--line-2)" strokeWidth="1" strokeDasharray="2 7" />}
          {layout.links.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeOpacity={l.op} strokeWidth={l.w} strokeLinecap="round" />
          ))}
        </svg>
        {N === 2 && layout.sharedCount > 0 && (
          <div className="mm-zone" style={{ left: cx, top: layout.cyc - size * 0.17 - 2 }}>{V3[lang].nav.center}</div>
        )}
        {layout.nodes.map((nd) => renderNode(nd, false))}
        {layout.anchors.map((nd) => renderNode(nd, true))}
      </React.Fragment>
    );
  }

  function ConnectionsBanner({ focal, lang }) {
    const V = V3[lang].nav;
    const F = window.FIG;
    if (focal.length < 2) {
      return (<div className="mm-conn"><span className="mm-hint">{V.multiHint}</span></div>);
    }
    const pairs = [];
    for (let i = 0; i < focal.length; i++) for (let j = i + 1; j < focal.length; j++) {
      pairs.push({ a: focal[i], b: focal[j], facts: window.connFacts(focal[i], focal[j], lang) });
    }
    const showFacts = (p) => (focal.length === 2 ? p.facts : p.facts.slice(0, 1));
    return (
      <div className="mm-conn">
        <div className="mm-conn-card">
          <div className="mm-conn-h">{V.between}</div>
          <div className="mm-conn-rows">
            {pairs.map((p, i) => (
              <div className="mm-pair" key={i}>
                {focal.length > 2 && (
                  <span className="pp">{fx(F[p.a].name, lang)}<span className="x">×</span>{fx(F[p.b].name, lang)}</span>
                )}
                <div className="mm-facts">
                  {showFacts(p).map((f, k) => (
                    <span className={"mm-fact" + (f.hot ? " hot" : "")} key={k}><span className="fd"></span>{f.text}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  window.MultiAnchorNet = MultiAnchorNet;
  window.ConnectionsBanner = ConnectionsBanner;
})();
