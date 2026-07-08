/* ════════════════════════════════════════════════════════════
   Al-Khwarizmi — "lives in context" dataset (EN + AR)
   Muhammad ibn Musa al-Khwarizmi · c. 780 – c. 850 CE
   Dates CE, approximate where the record is uncertain.
   ════════════════════════════════════════════════════════════ */
window.KW = {
  en: {
    dir: "ltr",
    figure: {
      name: "Muhammad ibn Musa al-Khwarizmi",
      short: "al-Khwarizmi",
      latin: "Algoritmi / Algorismus",
      life: "c. 780 – c. 850 CE",
      role: "Mathematician · Astronomer · Geographer",
      place: "House of Wisdom, Baghdad",
      origin: "Khwarazm region (south of the Aral Sea)",
      glyph: "خ",
      summary: "A founding scholar of the Abbasid House of Wisdom. His Al-Jabr gave algebra its name and method; his treatise on Hindu numerals carried the decimal system — and, through the Latin of his name, the word algorithm — into the language of every science that followed.",
      epitaph: "He did not invent the number. He taught the world a way to reason with it."
    },
    bio: [
      "He arrived in Baghdad as the Abbasid capital reached its height — a city of canals, paper-makers and translators, drawing learning from Persia, India and Greece into a single Arabic library. There, under the caliph al-Ma'mun, he joined the scholars of the House of Wisdom, charged with nothing less than gathering the knowledge of the world.",
      "His genius was not a single discovery but a way of working. In Al-Jabr he set down a general method — balancing and completing equations — that turned scattered problems into a discipline. In his book on Hindu numerals he gave that discipline a place to live: the decimal system. Centuries later, Latin scribes rendering his name coined a word for any step-by-step procedure — algorithm — and the method outran the man entirely."
    ],
    pillars: [
      { t: "Al-Jabr wa'l-Muqabala", d: "c. 820", note: "The Compendious Book on Calculation by Completion and Balancing. Gives algebra its name and its systematic method of solving equations.", tag: "algebra" },
      { t: "On Calculation with Hindu Numerals", d: "c. 825", note: "Introduced the decimal positional system to the Arabic world. Its Latin form — Algoritmi — became 'algorithm'.", tag: "the algorithm" },
      { t: "Zij al-Sindhind", d: "c. 820s", note: "Astronomical tables of the heavens — sines, planetary motion, the calendar — drawing on Indian and Greek sources.", tag: "the heavens" },
      { t: "Kitab Surat al-Ard", d: "c. 833", note: "A revised map of the known world: ~2,400 coordinates of cities, mountains and rivers, correcting Ptolemy's Geography.", tag: "the earth" }
    ],
    cats: {
      influence: "Teachers & Influences",
      patron:    "Patrons & Caliphs",
      peer:      "House of Wisdom",
      successor: "Heirs & Successors",
      world:     "The Wider Age"
    },
    catBlurb: {
      influence: "Whose work he inherited",
      patron:    "Whose courts he served",
      peer:      "Who worked beside him",
      successor: "Who built on his method",
      world:     "Who shared his century"
    },
    relations: [
      // INFLUENCES
      { id:"brahmagupta", name:"Brahmagupta", cat:"influence", life:"598 – 668", where:"Bhillamala, India", note:"His Brahmasphutasiddhanta carried the Hindu decimal numerals — and zero — that al-Khwarizmi systematised for the Arabic world." },
      { id:"ptolemy", name:"Ptolemy", cat:"influence", life:"c. 100 – 170", where:"Alexandria", note:"The Almagest and Geography set the frame for al-Khwarizmi's astronomical tables and his corrected map of the earth." },
      { id:"diophantus", name:"Diophantus", cat:"influence", life:"c. 201 – 285", where:"Alexandria", note:"The Greek 'father of arithmetic'; his equations prefigured the problems al-Khwarizmi would make general and systematic." },
      { id:"euclid", name:"Euclid", cat:"influence", life:"c. 325 – 265 BCE", where:"Alexandria", note:"The Elements supplied the geometric proofs by which al-Khwarizmi justified his rules for completing the square." },
      // PATRONS
      { id:"harun", name:"Harun al-Rashid", cat:"patron", life:"763 – 809", reign:"r. 786 – 809", where:"Baghdad", note:"Under his caliphate Baghdad became the richest city of the age and the translation movement took root." },
      { id:"mamun", name:"Caliph al-Ma'mun", cat:"patron", life:"786 – 833", reign:"r. 813 – 833", where:"Baghdad", note:"Al-Khwarizmi's direct patron. He championed the House of Wisdom and commissioned its great astronomical and geographic projects." },
      { id:"mutasim", name:"Caliph al-Mu'tasim", cat:"patron", life:"794 – 842", reign:"r. 833 – 842", where:"Baghdad · Samarra", note:"Successor to al-Ma'mun; sustained the scholars of the House of Wisdom into the next generation." },
      // PEERS
      { id:"banumusa", name:"The Banu Musa", cat:"peer", life:"fl. 9th c.", where:"Baghdad", note:"Three brothers — patrons, engineers and mathematicians whose Book of Ingenious Devices shared al-Khwarizmi's circle." },
      { id:"kindi", name:"Al-Kindi", cat:"peer", life:"c. 801 – 873", where:"Baghdad", note:"The 'Philosopher of the Arabs' — polymath of optics, medicine and the first known work on breaking ciphers." },
      { id:"hunayn", name:"Hunayn ibn Ishaq", cat:"peer", life:"809 – 873", where:"Baghdad", note:"The master translator of the age, rendering Greek medicine and science into Arabic with unmatched care." },
      { id:"farghani", name:"Al-Farghani", cat:"peer", life:"c. 800 – 870", where:"Baghdad", note:"Astronomer (the Latin 'Alfraganus') whose summary of the heavens shaped European cosmology for centuries." },
      { id:"sind", name:"Sind ibn Ali", cat:"peer", life:"fl. 9th c.", where:"Baghdad", note:"Astronomer of the House of Wisdom; a collaborator on the observational programme behind the Zij." },
      // SUCCESSORS
      { id:"abukamil", name:"Abu Kamil", cat:"successor", life:"c. 850 – 930", where:"Egypt", note:"'The Egyptian reckoner' — the first to build directly on Al-Jabr, extending algebra to higher powers." },
      { id:"battani", name:"Al-Battani", cat:"successor", life:"c. 858 – 929", where:"Raqqa", note:"Astronomer (the Latin 'Albategnius') who refined the tables and trigonometry al-Khwarizmi had begun." },
      { id:"karaji", name:"Al-Karaji", cat:"successor", life:"953 – 1029", where:"Baghdad", note:"Freed algebra from geometry, treating the unknown as a thing in itself — a direct descendant of Al-Jabr." },
      { id:"khayyam", name:"Omar Khayyam", cat:"successor", life:"1048 – 1131", where:"Nishapur", note:"Poet and mathematician who classified and solved the cubic equations beyond al-Khwarizmi's reach." },
      { id:"fibonacci", name:"Fibonacci", cat:"successor", life:"c. 1170 – 1250", where:"Pisa", note:"Leonardo of Pisa, whose Liber Abaci carried the Hindu-Arabic numerals — and al-Khwarizmi's reckoning — into Europe." },
      // THE WIDER AGE (cross-field contemporaries)
      { id:"shafii", name:"Imam al-Shafi'i", cat:"world", life:"767 – 820", where:"Baghdad · Cairo", note:"Jurist who founded one of the great schools of Islamic law in the same decades and the same city." },
      { id:"hanbal", name:"Ahmad ibn Hanbal", cat:"world", life:"780 – 855", where:"Baghdad", note:"Theologian and jurist — born, by tradition, the same year as al-Khwarizmi, and into the same Baghdad." },
      { id:"abunuwas", name:"Abu Nuwas", cat:"world", life:"756 – 814", where:"Baghdad", note:"The great wine-and-wit poet of the Abbasid court — the literary voice of al-Khwarizmi's city." },
      { id:"jahiz", name:"Al-Jahiz", cat:"world", life:"776 – 868", where:"Basra · Baghdad", note:"Prose master whose Book of Animals shows the same encyclopaedic appetite that drove the House of Wisdom." },
      { id:"charlemagne", name:"Charlemagne", cat:"world", life:"748 – 814", where:"Aachen", note:"Crowned emperor in the West the same generation — his Carolingian revival a distant mirror of Baghdad's." },
      { id:"ziryab", name:"Ziryab", cat:"world", life:"789 – 857", where:"Cordoba", note:"Musician and polymath who carried Baghdad's refinements clear across to al-Andalus." }
    ],
    cities: [
      { id:"khwarazm", name:"Khwarazm", role:"Origins", note:"The region south of the Aral Sea that gave him his name.", x:0.80, y:0.27 },
      { id:"baghdad", name:"Baghdad", role:"House of Wisdom", note:"The round city of the Abbasids — his life, his library, his work.", x:0.55, y:0.58, anchor:true },
      { id:"sinjar", name:"Plain of Sinjar", role:"Measuring the Earth", note:"Where al-Ma'mun's scholars measured a degree of the meridian.", x:0.42, y:0.42 },
      { id:"tadmur", name:"Tadmur (Palmyra)", role:"The survey", note:"A second baseline for the great geodesic measurement.", x:0.30, y:0.56 }
    ],
    timeline: [
      { y:"c. 780", t:"Born in the Khwarazm region", k:"life" },
      { y:"c. 809", t:"Comes to Baghdad at the height of the Abbasid age", k:"life" },
      { y:"813", t:"Al-Ma'mun accedes; the House of Wisdom flourishes", k:"patron" },
      { y:"c. 820", t:"Writes Al-Jabr — algebra is named", k:"work" },
      { y:"c. 825", t:"On Calculation with Hindu Numerals", k:"work" },
      { y:"c. 830", t:"Astronomical & geodesic programme; Surat al-Ard", k:"work" },
      { y:"833", t:"Al-Ma'mun dies; al-Mu'tasim continues the patronage", k:"patron" },
      { y:"c. 850", t:"Dies in Baghdad", k:"life" }
    ],
    journey: [
      { y:"9th c.", place:"Baghdad", t:"Al-Jabr is written at the House of Wisdom." },
      { y:"10th c.", place:"Cordoba", t:"His works travel west into al-Andalus." },
      { y:"1145", place:"Toledo", t:"Robert of Chester translates Al-Jabr into Latin." },
      { y:"1202", place:"Pisa", t:"Fibonacci's Liber Abaci spreads the numerals through Europe." },
      { y:"16th c.", place:"Europe", t:"'Algebra' and 'algorism' enter every European tongue." },
      { y:"today", place:"everywhere", t:"'Algorithm' names the engine of all computation." }
    ],
    ui: {
      brand:"Alalaam", tagline:"Lives, in context.",
      hint:"Three directions · drag to reorder · ←/→ in focus mode",
      explore:"Explore the circle", read:"Read the life", born:"Born", died:"Died",
      places:"His cities",
      worksTitle:"Four works that outlived their century",
      contextTitle:"The circle around him", legacyTitle:"The journey of the algorithm",
      timelineTitle:"A life in the Abbasid age", mapTitle:"Where the work happened",
      same:"same year", overlap:"contemporary", reign:"reign",
      circle:"lives in his circle", ringNote:"ring distance ≈ closeness to his work",
      figureKicker:"The subject", filterAll:"All", scrollNote:"older → newer",
      compare:"Compare two lives", lens:"View"
    }
  }
};

/* ── Arabic ──────────────────────────────────────────────────── */
window.KW.ar = {
  dir: "rtl",
  figure: {
    name: "محمد بن موسى الخوارزمي",
    short: "الخوارزمي",
    latin: "Algoritmi",
    life: "نحو ٧٨٠ – ٨٥٠ م",
    role: "رياضياتي · فلكي · جغرافي",
    place: "بيت الحكمة، بغداد",
    origin: "إقليم خوارزم (جنوب بحر آرال)",
    glyph: "خ",
    summary: "من مؤسِّسي علماء بيت الحكمة في العصر العباسي. أعطى كتابه «الجبر والمقابلة» عِلمَ الجبر اسمَه ومنهجَه، وحمل كتابُه في حساب الهند نظامَ الأرقام العشرية — ومن صورة اسمه باللاتينية جاءت كلمة «خوارزمية» — إلى لغة كل علمٍ تلاه.",
    epitaph: "لم يخترع العدد، لكنه علّم العالم كيف يفكّر به."
  },
  bio: [
    "قَدِم إلى بغداد وقد بلغت العاصمة العباسية ذروتها — مدينةُ قنواتٍ ووُرّاقين ومترجمين، تجمع علوم فارس والهند واليونان في مكتبةٍ عربيةٍ واحدة. وهناك، في كنف الخليفة المأمون، انضمّ إلى علماء بيت الحكمة المكلَّفين بأمرٍ لا يقلّ عن جمع معارف العالم كلّه.",
    "لم تكن عبقريته اكتشافًا واحدًا، بل طريقةً في العمل. في «الجبر» أرسى منهجًا عامًّا — موازنةُ المعادلات وإكمالها — حوّل المسائل المتفرّقة إلى علمٍ قائم. وفي كتابه عن أرقام الهند منح ذلك العلم مكانًا يسكنه: النظام العشري. وبعد قرون، صاغ النسّاخ اللاتين من اسمه كلمةً لكل إجراءٍ متسلسل — «خوارزمية» — فسبق المنهجُ صاحبَه تمامًا."
  ],
  pillars: [
    { t:"الجبر والمقابلة", d:"نحو ٨٢٠ م", note:"الكتاب المختصر في حساب الجبر والمقابلة. منه أخذ علم الجبر اسمَه ومنهجَه المنظّم في حلّ المعادلات.", tag:"الجبر" },
    { t:"في حساب الهند", d:"نحو ٨٢٥ م", note:"أدخل النظام العشري الموضعي إلى العالم العربي. ومن صورته اللاتينية «Algoritmi» جاءت كلمة «خوارزمية».", tag:"الخوارزمية" },
    { t:"زيج السند هند", d:"عقد ٨٢٠", note:"جداول فلكية للسماء — الجيوب وحركة الكواكب والتقويم — مستندًا إلى مصادر هندية ويونانية.", tag:"السماء" },
    { t:"كتاب صورة الأرض", d:"نحو ٨٣٣ م", note:"خريطة منقّحة للعالم المعروف: نحو ٢٤٠٠ إحداثيٍّ للمدن والجبال والأنهار، مصحِّحًا جغرافيا بطليموس.", tag:"الأرض" }
  ],
  cats: {
    influence:"الأساتذة والمؤثِّرون", patron:"الرعاة والخلفاء", peer:"بيت الحكمة",
    successor:"الورثة والخلفاء العلميون", world:"العصر الأوسع"
  },
  catBlurb: {
    influence:"من ورث عنهم علمه", patron:"من خدم في بلاطهم", peer:"من عمل إلى جانبه",
    successor:"من بنى على منهجه", world:"من شاركه قرنه"
  },
  relations: [
    { id:"brahmagupta", name:"براهماغوبتا", cat:"influence", life:"٥٩٨ – ٦٦٨", where:"بهلمالا، الهند", note:"حمل كتابُه أرقام الهند العشرية — والصفر — التي نظّمها الخوارزمي للعالم العربي." },
    { id:"ptolemy", name:"بطليموس", cat:"influence", life:"نحو ١٠٠ – ١٧٠", where:"الإسكندرية", note:"وضع «المجسطي» و«الجغرافيا» الإطارَ لجداول الخوارزمي الفلكية وخريطته المصحَّحة للأرض." },
    { id:"diophantus", name:"ديوفانتوس", cat:"influence", life:"نحو ٢٠١ – ٢٨٥", where:"الإسكندرية", note:"«أبو الحساب» اليوناني؛ مهّدت معادلاته للمسائل التي عمّمها الخوارزمي ونظّمها." },
    { id:"euclid", name:"إقليدس", cat:"influence", life:"نحو ٣٢٥ – ٢٦٥ ق.م", where:"الإسكندرية", note:"قدّمت «الأصول» البراهينَ الهندسية التي برهن بها الخوارزمي على قواعد إكمال المربع." },
    { id:"harun", name:"هارون الرشيد", cat:"patron", life:"٧٦٣ – ٨٠٩", reign:"حكم ٧٨٦ – ٨٠٩", where:"بغداد", note:"في خلافته صارت بغداد أغنى مدن العصر، وترسّخت حركة الترجمة." },
    { id:"mamun", name:"الخليفة المأمون", cat:"patron", life:"٧٨٦ – ٨٣٣", reign:"حكم ٨١٣ – ٨٣٣", where:"بغداد", note:"راعي الخوارزمي المباشر. احتضن بيت الحكمة وكلّف بمشاريعه الفلكية والجغرافية الكبرى." },
    { id:"mutasim", name:"الخليفة المعتصم", cat:"patron", life:"٧٩٤ – ٨٤٢", reign:"حكم ٨٣٣ – ٨٤٢", where:"بغداد · سامراء", note:"خليفة المأمون؛ أدام رعاية علماء بيت الحكمة إلى الجيل التالي." },
    { id:"banumusa", name:"بنو موسى", cat:"peer", life:"القرن التاسع", where:"بغداد", note:"ثلاثة إخوة — رعاة ومهندسون ورياضياتيون شاركوا الخوارزمي حلقتَه." },
    { id:"kindi", name:"الكِندي", cat:"peer", life:"نحو ٨٠١ – ٨٧٣", where:"بغداد", note:"«فيلسوف العرب» — موسوعيٌّ في البصريات والطب وأول عملٍ معروف في كسر الشيفرات." },
    { id:"hunayn", name:"حنين بن إسحاق", cat:"peer", life:"٨٠٩ – ٨٧٣", where:"بغداد", note:"سيّد المترجمين في عصره، نقل الطب والعلم اليوناني إلى العربية بعناية لا تُضاهى." },
    { id:"farghani", name:"الفَرغاني", cat:"peer", life:"نحو ٨٠٠ – ٨٧٠", where:"بغداد", note:"فلكيٌّ صاغ خلاصةً للسماء شكّلت علم الكون الأوروبي قرونًا." },
    { id:"sind", name:"سند بن علي", cat:"peer", life:"القرن التاسع", where:"بغداد", note:"فلكيُّ بيت الحكمة؛ شريكٌ في برنامج الرصد وراء «الزيج»." },
    { id:"abukamil", name:"أبو كامل", cat:"successor", life:"نحو ٨٥٠ – ٩٣٠", where:"مصر", note:"«الحاسب المصري» — أول من بنى مباشرةً على «الجبر»، وامتدّ به إلى قوى أعلى." },
    { id:"battani", name:"البتّاني", cat:"successor", life:"نحو ٨٥٨ – ٩٢٩", where:"الرقّة", note:"فلكيٌّ نقّح الجداول وعلم المثلثات الذي بدأه الخوارزمي." },
    { id:"karaji", name:"الكَرَجي", cat:"successor", life:"٩٥٣ – ١٠٢٩", where:"بغداد", note:"حرّر الجبر من الهندسة، فعامل المجهول شيئًا قائمًا بذاته — وريثٌ مباشر لـ«الجبر»." },
    { id:"khayyam", name:"عمر الخيّام", cat:"successor", life:"١٠٤٨ – ١١٣١", where:"نيسابور", note:"شاعرٌ ورياضياتي صنّف المعادلات التكعيبية وحلّها فيما تجاوز مدى الخوارزمي." },
    { id:"fibonacci", name:"فيبوناتشي", cat:"successor", life:"نحو ١١٧٠ – ١٢٥٠", where:"بيزا", note:"ليوناردو البيزي، حمل كتابُه الأرقامَ الهندية-العربية — وحساب الخوارزمي — إلى أوروبا." },
    { id:"shafii", name:"الإمام الشافعي", cat:"world", life:"٧٦٧ – ٨٢٠", where:"بغداد · القاهرة", note:"فقيهٌ أسّس أحد المذاهب الكبرى في العقود ذاتها والمدينة ذاتها." },
    { id:"hanbal", name:"أحمد بن حنبل", cat:"world", life:"٧٨٠ – ٨٥٥", where:"بغداد", note:"محدِّثٌ وفقيه — وُلد بحسب الرواية في عام الخوارزمي نفسه وفي بغداد ذاتها." },
    { id:"abunuwas", name:"أبو نوّاس", cat:"world", life:"٧٥٦ – ٨١٤", where:"بغداد", note:"شاعر الخمر والظرف الأكبر في البلاط العباسي — الصوت الأدبي لمدينة الخوارزمي." },
    { id:"jahiz", name:"الجاحظ", cat:"world", life:"٧٧٦ – ٨٦٨", where:"البصرة · بغداد", note:"إمام النثر، يُظهر «كتاب الحيوان» النهمَ الموسوعي ذاته الذي حرّك بيت الحكمة." },
    { id:"charlemagne", name:"شارلمان", cat:"world", life:"٧٤٨ – ٨١٤", where:"آخن", note:"تُوِّج إمبراطورًا في الغرب في الجيل نفسه — نهضته الكارولنجية مرآةٌ بعيدة لبغداد." },
    { id:"ziryab", name:"زرياب", cat:"world", life:"٧٨٩ – ٨٥٧", where:"قرطبة", note:"موسيقيٌّ وموسوعيٌّ حمل رقيّ بغداد إلى الأندلس." }
  ],
  cities: [
    { id:"khwarazm", name:"خوارزم", role:"النشأة", note:"الإقليم جنوب بحر آرال الذي منحه اسمه.", x:0.80, y:0.27 },
    { id:"baghdad", name:"بغداد", role:"بيت الحكمة", note:"مدينة العباسيين المدوّرة — حياته ومكتبته وعمله.", x:0.55, y:0.58, anchor:true },
    { id:"sinjar", name:"سهل سنجار", role:"قياس الأرض", note:"حيث قاس علماء المأمون درجةً من خط الزوال.", x:0.42, y:0.42 },
    { id:"tadmur", name:"تدمر", role:"المسح", note:"خطُّ أساسٍ ثانٍ للقياس الجيوديسي الكبير.", x:0.30, y:0.56 }
  ],
  timeline: [
    { y:"نحو ٧٨٠", t:"وُلد في إقليم خوارزم", k:"life" },
    { y:"نحو ٨٠٩", t:"يقدم إلى بغداد في ذروة العصر العباسي", k:"life" },
    { y:"٨١٣", t:"يتولّى المأمون؛ ويزدهر بيت الحكمة", k:"patron" },
    { y:"نحو ٨٢٠", t:"يكتب «الجبر» — وبه يُسمّى العلم", k:"work" },
    { y:"نحو ٨٢٥", t:"«في حساب الهند»", k:"work" },
    { y:"نحو ٨٣٠", t:"برنامج فلكي وجيوديسي؛ «صورة الأرض»", k:"work" },
    { y:"٨٣٣", t:"يموت المأمون؛ ويُكمل المعتصم الرعاية", k:"patron" },
    { y:"نحو ٨٥٠", t:"يتوفّى في بغداد", k:"life" }
  ],
  journey: [
    { y:"ق ٩", place:"بغداد", t:"يُكتب «الجبر» في بيت الحكمة." },
    { y:"ق ١٠", place:"قرطبة", t:"تنتقل أعماله غربًا إلى الأندلس." },
    { y:"١١٤٥", place:"طليطلة", t:"يترجم روبرت التشستري «الجبر» إلى اللاتينية." },
    { y:"١٢٠٢", place:"بيزا", t:"ينشر «كتاب الحساب» لفيبوناتشي الأرقامَ في أوروبا." },
    { y:"ق ١٦", place:"أوروبا", t:"تدخل «الجبر» و«الخوارزمية» كلَّ ألسنة أوروبا." },
    { y:"اليوم", place:"كل مكان", t:"تُسمّى «الخوارزمية» محرّكَ كل حوسبة." }
  ],
  ui: {
    brand:"الأعلام", tagline:"سِيَرٌ في سياقها.",
    hint:"ثلاثة اتجاهات · اسحب لإعادة الترتيب · انقر مرتين على التسمية لتغييرها",
    explore:"استكشف الحلقة", read:"اقرأ السيرة", born:"وُلد", died:"تُوفّي",
    places:"مُدُنه",
    worksTitle:"أربعة مؤلَّفات تجاوزت قرنها",
    contextTitle:"الحلقة من حوله", legacyTitle:"رحلة الخوارزمية",
    timelineTitle:"حياةٌ في العصر العباسي", mapTitle:"حيث جرى العمل",
    same:"العام نفسه", overlap:"معاصر", reign:"حكم",
    circle:"نفسًا في حلقته", ringNote:"بُعد الحلقة ≈ القرب من عمله",
    figureKicker:"الشخصية", filterAll:"الكل", scrollNote:"الأقدم ← الأحدث",
    compare:"قارِن سيرتين", lens:"عرض"
  }
};
