/* ════════════════════════════════════════════════════════════
   v3 app — labels, helpers, figure resolver
   ════════════════════════════════════════════════════════════ */
(function () {
  // resolve a {en,ar} value (or array of them) to current language
  window.fx = (v, lang) => (v == null ? "" : (typeof v === "object" && (v.en || v.ar) ? (v[lang] || v.en) : v));

  window.V3 = {
    en: {
      tabs: { explore: "The Majlis", compare: "Compare lives" },
      props: {
        teacher: "Teacher", student: "Student", peer: "Peers",
        acq: "Acquaintances", gen: "Same generation",
        born: "Born in", died: "Died in", lived: "Lived in",
        bio: "Biography", pubs: "Publications",
      },
      people: "Circle of people", lifework: "Life & work",
      noneRecorded: "None recorded",
      rel: {
        self: "The subject",
        direct: "Worked beside al-Khwarizmi",
        possible: "May have crossed paths with him",
        past: "A source he read",
        future: "An heir of his method",
      },
      relShort: { self: "subject", direct: "met", possible: "possible", past: "source", future: "heir" },
      hintExplore: "Click any figure to open its profile · click the map to dismiss",
      pickPrompt: "Choose a figure",
      first: "First figure", second: "Second figure",
      connect: "How they connect",
      overlap: (a, b) => `Lives overlapped, c. ${a}–${b}`,
      overlapNo: "Lives did not overlap",
      couldMeet: "a meeting was possible", onlyBooks: "could only meet through books",
      sharedCity: "Shared city", directRel: "Named in each other's circle",
      sameGen: "Of the same generation", noLink: "No direct link recorded — connected through the wider age",
      vs: "compared with", clear: "Clear",
      nav: {
        focus: "Focal figures", add: "Add a figure", search: "Search", searchPh: "Search by name…",
        browse: "Browse all", done: "Done", reset: "Reset to al-Khwarizmi", noResults: "No figures found",
        showConn: "Connections", focal: "Focal", remove: "Remove",
        between: "Between the focal figures", sharedConn: "Shared circle", center: "Their shared circle",
        more: (n) => `+${n} more`, multiHint: "Add another figure to see what connects them",
        pickToFocus: "Search or browse to bring figures into focus", addVia: "Add via search or browse",
      },
      catName: { self: "The subject", influence: "Sources & teachers", patron: "Patrons & caliphs", peer: "House of Wisdom", successor: "Heirs of the method", world: "The wider age" },
    },
    ar: {
      tabs: { explore: "المجلس", compare: "قارِن السِّيَر" },
      props: {
        teacher: "المعلّم", student: "التلميذ", peer: "الأقران",
        acq: "المعارف", gen: "الجيل نفسه",
        born: "وُلد في", died: "تُوفّي في", lived: "عاش في",
        bio: "السيرة", pubs: "المؤلَّفات",
      },
      people: "حلقة الأشخاص", lifework: "الحياة والعمل",
      noneRecorded: "لا شيء مذكور",
      rel: {
        self: "الشخصية",
        direct: "عمل إلى جانب الخوارزمي",
        possible: "ربما تقاطعت طرقهما",
        past: "مصدرٌ قرأه",
        future: "وريثُ منهجه",
      },
      relShort: { self: "الشخصية", direct: "التقيا", possible: "محتمل", past: "مصدر", future: "وريث" },
      hintExplore: "انقر أيّ شخصية لعرض ملفّها · انقر الخريطة للإغلاق",
      pickPrompt: "اختر شخصية",
      first: "الشخصية الأولى", second: "الشخصية الثانية",
      connect: "كيف يتّصلان",
      overlap: (a, b) => `تداخلت حياتاهما، نحو ${a}–${b}`,
      overlapNo: "لم تتداخل حياتاهما",
      couldMeet: "كان اللقاء ممكنًا", onlyBooks: "لا لقاء إلا عبر الكتب",
      sharedCity: "مدينة مشتركة", directRel: "مذكورٌ في حلقة كلٍّ منهما",
      sameGen: "من الجيل نفسه", noLink: "لا صلة مباشرة مسجّلة — يتّصلان عبر العصر الأوسع",
      vs: "مقارنةً بـ", clear: "مسح",
      nav: {
        focus: "الشخصيات المحورية", add: "أضِف شخصية", search: "بحث", searchPh: "ابحث بالاسم…",
        browse: "تصفّح الكل", done: "تم", reset: "العودة إلى الخوارزمي", noResults: "لا توجد نتائج",
        showConn: "الصِلات", focal: "محورية", remove: "إزالة",
        between: "بين الشخصيات المحورية", sharedConn: "الحلقة المشتركة", center: "حلقتهم المشتركة",
        more: (n) => `+${n}`, multiHint: "أضِف شخصية أخرى لترى ما يجمعهما",
        pickToFocus: "ابحث أو تصفّح لإحضار شخصيات إلى البؤرة", addVia: "أضِف عبر البحث أو التصفّح",
      },
      catName: { self: "الشخصية", influence: "المصادر والأساتذة", patron: "الرعاة والخلفاء", peer: "بيت الحكمة", successor: "ورثة المنهج", world: "العصر الأوسع" },
    },
  };

  // tier of a figure relative to al-Khwarizmi
  window.tierOf = (id) => (id === "kw" ? "self" : (KW2.INTER[id] || "possible"));

  // category → medallion variant (peer/influence/etc.) ; self uses brass
  window.figVariant = (cat) => (cat === "self" ? "brass" : (MED_VARIANT[cat] || "sand"));

  // collect a figure's people ids across all relationship fields
  window.peopleIds = (f) => {
    const ids = new Set();
    ["teacher", "student", "peer", "acq", "gen"].forEach((k) => (f[k] || []).forEach((p) => p.id && ids.add(p.id)));
    return ids;
  };
  window.cityNames = (f) => {
    const s = new Set();
    [f.born, f.died, ...(f.lived || [])].forEach((c) => c && c.en && c.en !== "Unknown" && c.en !== "—" && s.add(c.en));
    return s;
  };

  // figures grouped for browse, in a sensible order
  window.CAT_BROWSE = ["self", "patron", "peer", "influence", "successor", "world"];

  // search: match a query against a figure's names/role in either language
  window.figMatches = (q) => {
    q = (q || "").trim().toLowerCase();
    if (!q) return window.FIG_ORDER;
    return window.FIG_ORDER.filter((id) => {
      const f = window.FIG[id];
      return [f.name.en, f.name.ar, f.full.en, f.full.ar, f.role.en, id]
        .some((s) => (s || "").toLowerCase().includes(q));
    });
  };

  // pairwise connection facts between two figures (reused by multi view)
  window.connFacts = (aId, bId, lang) => {
    const V = V3[lang], F = window.FIG, out = [];
    if (aId === bId) return out;
    const FA = F[aId], FB = F[bId];
    const ya = KW2.YEARS[aId], yb = KW2.YEARS[bId];
    if (ya && yb) {
      const lo = Math.max(ya[0], yb[0]), hi = Math.min(ya[1], yb[1]);
      if (hi > lo) out.push({ hot: true, text: V.overlap(KW2.toDigits(lo, lang), KW2.toDigits(hi, lang)) + " · " + V.couldMeet });
      else out.push({ hot: false, text: V.overlapNo + " · " + V.onlyBooks });
    }
    const idsA = peopleIds(FA), idsB = peopleIds(FB);
    if (idsA.has(bId) || idsB.has(aId)) out.push({ hot: true, text: V.directRel });
    const cityA = cityNames(FA), cityB = cityNames(FB);
    [...cityA].filter((c) => cityB.has(c)).forEach((c) => {
      const city = FA.lived.concat([FA.born, FA.died]).find((x) => x && x.en === c);
      out.push({ hot: true, text: V.sharedCity + ": " + (city ? fx(city, lang) : c) });
    });
    const genA = (FA.gen || []).some((p) => p.id === bId), genB = (FB.gen || []).some((p) => p.id === aId);
    if ((genA || genB) && !out.some((o) => o.text === V.directRel)) out.push({ hot: false, text: V.sameGen });
    if (!out.some((o) => o.hot)) out.push({ hot: false, text: V.noLink });
    return out;
  };

  // are two figures directly linked (one named in the other's circle)?
  window.directLinked = (aId, bId) => peopleIds(window.FIG[aId]).has(bId) || peopleIds(window.FIG[bId]).has(aId);
})();
