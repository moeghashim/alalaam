/* ════════════════════════════════════════════════════════════
   v2 shared — interaction-certainty model for the network views
   direct   = documented: met & worked beside him
   possible = shared his city & decades: may have crossed paths
   past     = sources he knew through books (dead before him)
   future   = heirs who knew HIM through books (after him)
   ════════════════════════════════════════════════════════════ */
window.KW2 = {
  INTER: {
    mamun: "direct", mutasim: "direct", banumusa: "direct", kindi: "direct",
    hunayn: "direct", farghani: "direct", sind: "direct",
    harun: "possible", shafii: "possible", hanbal: "possible", abunuwas: "possible",
    jahiz: "possible", charlemagne: "possible", ziryab: "possible",
    brahmagupta: "past", ptolemy: "past", diophantus: "past", euclid: "past",
    abukamil: "future", battani: "future", karaji: "future", khayyam: "future", fibonacci: "future",
  },
  YEARS: {
    kw: [780, 850],
    brahmagupta: [598, 668], ptolemy: [100, 170], diophantus: [201, 285], euclid: [-325, -265],
    harun: [763, 809], mamun: [786, 833], mutasim: [794, 842],
    banumusa: [800, 873], kindi: [801, 873], hunayn: [809, 873], farghani: [800, 870], sind: [795, 860],
    abukamil: [850, 930], battani: [858, 929], karaji: [953, 1029], khayyam: [1048, 1131], fibonacci: [1170, 1250],
    shafii: [767, 820], hanbal: [780, 855], abunuwas: [756, 814], jahiz: [776, 868],
    charlemagne: [748, 814], ziryab: [789, 857],
  },
  /* edge colors per tier — parchment + night variants */
  EDGE: {
    direct: "#8C6620", possible: "#8A7A55", past: "#335E9E", future: "#A14A60",
  },
  EDGE_NIGHT: {
    direct: "#C99A45", possible: "#B0A074", past: "#5E86C2", future: "#C36C82",
  },
  DASH: { direct: "", possible: "8 6", past: "2 6", future: "2 6" },
  L: {
    en: {
      tiers: {
        direct:   { t: "Met & worked beside him",   d: "Documented — the House of Wisdom and al-Ma'mun's court." },
        possible: { t: "May have crossed paths",     d: "Alive in his lifetime, sharing his city or his world." },
        past:     { t: "Knew them through books",    d: "Dead before his birth — the sources he inherited." },
        future:   { t: "Knew him through books",     d: "Born after him — the heirs of his method." },
      },
      chip: { direct: "met", possible: "possible", past: "books", future: "books" },
      majlis: { t: "The Majlis", s: "Every line is a relationship; its texture is the evidence." },
      chron:  { t: "The Chronicle", s: "Time is the test of who could have met." },
      diwan:  { t: "The Diwan", s: "Knowledge flows in from the past, through one mind, out to the future." },
      lifetime: "His lifetime", legend: "How to read the lines",
      beyondPast: "Beyond the frame — ancient sources", beyondFuture: "Beyond the frame — later heirs",
      window: "darker segment = years a meeting was possible",
      court: "The Court", circle: "The Circle", sources: "The Sources", age: "The Age", heirs: "The Heirs",
      himself: "the subject",
    },
    ar: {
      tiers: {
        direct:   { t: "التقاه وعمل إلى جانبه",  d: "موثَّق — بيت الحكمة وبلاط المأمون." },
        possible: { t: "ربما تقاطعت طرقهما",      d: "عاش في زمنه، وشاركه مدينته أو عالمه." },
        past:     { t: "عرفهم في الكتب وحدها",    d: "رحلوا قبل مولده — المصادر التي ورثها." },
        future:   { t: "عرفوه في كتبه",           d: "وُلدوا بعده — ورثة منهجه." },
      },
      chip: { direct: "التقيا", possible: "محتمل", past: "كتب", future: "كتب" },
      majlis: { t: "المجلس", s: "كل خطٍّ علاقة، ونسيجُه هو الدليل." },
      chron:  { t: "السجلّ الزمني", s: "الزمنُ محكُّ من كان يمكن أن يلتقي." },
      diwan:  { t: "الديوان", s: "تتدفّق المعرفة من الماضي، عبر عقلٍ واحد، إلى المستقبل." },
      lifetime: "حياته", legend: "كيف تُقرأ الخطوط",
      beyondPast: "خارج الإطار — المصادر القديمة", beyondFuture: "خارج الإطار — الورثة اللاحقون",
      window: "الجزء الأغمق = سنواتُ لقاءٍ ممكن",
      court: "البلاط", circle: "الحلقة", sources: "المصادر", age: "العصر", heirs: "الورثة",
      himself: "الشخصية",
    },
  },
  toDigits(str, lang) {
    if (lang !== "ar") return String(str);
    const m = { "0":"٠","1":"١","2":"٢","3":"٣","4":"٤","5":"٥","6":"٦","7":"٧","8":"٨","9":"٩" };
    return String(str).replace(/[0-9]/g, (d) => m[d]);
  },
};
