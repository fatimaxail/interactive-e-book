"use strict";
/* ============================================================
   ألبوم أُسرتي — story: panels, controls, builder, six scenes,
   links (match cuts), expression & teacher evaluation, ending
   ============================================================ */
const panelEl=$("#panel");
let CUR={mode:"cover",n:0};
const fresh=()=>Array.from({length:7},()=>({mode:null,text:"",helpOpen:false,picked:null,phase:"express",ev:null}));
let ST=fresh();
let CHOSEN=null;
const TITLES=[null,"صباح الخير وقُبلة اليد","نستمع إلى حكاية الأب","نحملها معًا","جاء دور الأخ","نعتني بالأم","الأم تستمع"];
const SPK={narrator:{n:()=>"الراوية",c:"#8A63FF"},char:{n:()=>NAME()||G("البطل","البطلة"),c:"#16B3A6"},mom:{n:()=>"الأم",c:"#FF6F61"},dad:{n:()=>"الأب",c:"#3CC56B"},bro:{n:()=>"الأخ الصغير",c:"#FFB04A"}};
const QS=Array.from({length:7},(_,n)=>n?()=>({q:lineInfo("q"+n).text,h:[...HORD[n]].map(k=>({k,t:lineInfo("h"+n+k).text}))}):null);
const UI={oral:()=>lineInfo("u_oral").text,helpQ:()=>lineInfo("u_helpq").text,now:()=>lineInfo("u_now").text,good:()=>lineInfo("u_good").text,retry:()=>lineInfo("u_retry").text};
const ICN={
  write:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19l1-4.2L15.4 5.4a2 2 0 012.8 0l.4.4a2 2 0 010 2.8L9.2 18z" fill="#FFB04A"/><path d="M14.2 6.6l3.2 3.2" stroke="#0D8A80" stroke-width="2"/><path d="M5 19l1-4.2 3.2 3.2z" fill="#FFE2B8"/><path d="M5 19l.45-1.9 1.45 1.45z" fill="#2B2E44"/><path d="M4 21.5h16" stroke="#0D8A80" stroke-width="2" stroke-linecap="round"/></svg>`,
  oral:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="2.5" width="7" height="11.5" rx="3.5" fill="#FF6F61"/><path d="M10 6h1.6M10 9h1.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><path d="M5.5 11a6.5 6.5 0 0013 0" stroke="#9A5A00" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M12 17.5V21M9 21.2h6" stroke="#9A5A00" stroke-width="2" stroke-linecap="round"/></svg>`,
  help:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a6.2 6.2 0 00-3.7 11.2c.7.6 1.1 1.3 1.1 2.3h5.2c0-1 .4-1.7 1.1-2.3A6.2 6.2 0 0012 2.5z" fill="#FFD43B" stroke="#F2B500" stroke-width="1.5"/><path d="M10.2 9.5l1.8 2 1.8-2" stroke="#F2B500" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="9.4" y="17" width="5.2" height="2.2" rx="1" fill="#FF6F61"/><rect x="10.2" y="19.8" width="3.6" height="1.8" rx=".9" fill="#FF6F61"/></svg>`};

/* ---------------- النصّ المسموع: سرد متسلسل بضمير الغائب يذكر اسم البطل/البطلة ----------------
   b/g: نصّ الشاشة للولد/للبنت ({N} = اسم البطل). ab/ag: نصّ التسجيل الصوتي (بلا اسم).
   v:1 = جملة يقولها البطل نفسه، تُسجَّل بصوت ولد وصوت بنت.
   اسم الملف: <id>.mp3 للجمل الموحّدة، و<id>_b.mp3 / <id>_g.mp3 للجمل المتغيّرة. */
const SCRIPT={
  c01:{w:"narrator",b:"قبلَ أن نبدأَ الحكاية، لِنُصمِّمْ بطلَ حكايتِنا أو بطلتَها!"},
  c02:{w:"narrator",b:"هذا هو {N}، بطلُ حكايتِنا اليوم!",g:"هذه هي {N}، بطلةُ حكايتِنا اليوم!",ab:"هذا هو بطلُ حكايتِنا اليوم!",ag:"هذه هي بطلةُ حكايتِنا اليوم!"},
  c03:{w:"mom",b:"تعالَ إلى غرفةِ الجلوسِ يا ابني!",g:"تعالَي إلى غرفةِ الجلوسِ يا ابنتي!"},
  c04:{w:"narrator",b:"سمعَ {N} صوتَ الأمّ، فأسرعَ إليها.",g:"سمعَتْ {N} صوتَ الأمّ، فأسرعَتْ إليها."},
  /* المشهد 1 */
  s1a:{w:"narrator",b:"في صباحٍ مشمس، دخلَ {N} غرفةَ الجلوس. كانت الأمُّ تجلسُ بجانبِ الأبِ على الأريكة.",g:"في صباحٍ مشمس، دخلَتْ {N} غرفةَ الجلوس. كانت الأمُّ تجلسُ بجانبِ الأبِ على الأريكة."},
  s1e:{w:"narrator",b:"التفتَتِ الأمُّ إلى {N}، ومدَّتْ يدَها مبتسمة.",ab:"التفتَتِ الأمُّ إلى بطلِنا، ومدَّتْ يدَها مبتسمة.",ag:"التفتَتِ الأمُّ إلى بطلتِنا، ومدَّتْ يدَها مبتسمة."},
  s1f:{w:"mom",b:"صباحَ الخيرِ يا ابني!",g:"صباحَ الخيرِ يا ابنتي!"},
  s1g:{w:"narrator",b:"اقتربَ {N} من الأمّ، وأمسكَ يدَها، وانحنى فقبَّلَها.",g:"اقتربَتْ {N} من الأمّ، وأمسكَتْ يدَها، وانحنَتْ فقبَّلَتْها."},
  s1h:{w:"narrator",b:"ابتسمَتِ الأمُّ، ووضعَتْ يدَها الأخرى على كتفِ {N}.",ab:"ابتسمَتِ الأمُّ، ووضعَتْ يدَها الأخرى على كتفِ بطلِنا.",ag:"ابتسمَتِ الأمُّ، ووضعَتْ يدَها الأخرى على كتفِ بطلتِنا."},
  m1:{w:"narrator",b:"أشرقَ وجهُ الأمّ، ولمعَتْ عيناها."},
  s1b:{w:"narrator",b:"ثمّ وضعَتِ الأمُّ ألبومًا جديدًا على الطاولة، وفتحَتْ صفحتَه الأولى."},
  s1c:{w:"mom",b:"ما رأيُكَ أن نحتفظَ بستِّ لحظاتٍ من يومِنا؟ وهذه اللحظةُ الجميلةُ أوّلُها!",g:"ما رأيُكِ أن نحتفظَ بستِّ لحظاتٍ من يومِنا؟ وهذه اللحظةُ الجميلةُ أوّلُها!"},
  s1d:{w:"char",v:1,b:"فكرةٌ رائعةٌ يا أمّي!"},
  l1a:{w:"narrator",b:"مدَّ الأبُ يدَه إلى كتابٍ بجانبِه، وقلَّبَ صفحاتِه."},
  l1b:{w:"dad",b:"تعالَوا، عندي حكاية!"},
  l1c:{w:"narrator",b:"التفتَ {N} إلى الأب، وجلسَ على السجّادةِ مع الأخِ الصغير، وفي يدِه كتابُه.",g:"التفتَتْ {N} إلى الأب، وجلسَتْ على السجّادةِ مع الأخِ الصغير، وفي يدِها كتابُها."},
  /* المشهد 2 */
  s2a:{w:"narrator",b:"اجتمعَتِ الأسرةُ في الغرفة، وبدأَ الأبُ يحكي."},
  s2b:{w:"dad",b:"كان يا ما كان، في الصحراءِ جملٌ كبير… كبيرٌ بهذا الحجم!"},
  s2c:{w:"narrator",b:"لكنَّ {N} كان ما يزالُ يتصفَّحُ كتابَه، فتوقَّفَ الأبُ قليلًا ونظرَ إليه.",g:"لكنَّ {N} كانت ما تزالُ تتصفَّحُ كتابَها، فتوقَّفَ الأبُ قليلًا ونظرَ إليها.",ab:"لكنَّ بطلَنا كان ما يزالُ يتصفَّحُ كتابَه، فتوقَّفَ الأبُ قليلًا ونظرَ إليه.",ag:"لكنَّ بطلتَنا كانت ما تزالُ تتصفَّحُ كتابَها، فتوقَّفَ الأبُ قليلًا ونظرَ إليها."},
  s2d:{w:"narrator",b:"وضعَ {N} علامةً بين الصفحات، وأغلقَ كتابَه، ورفعَ رأسَه ينظرُ إلى الأب.",g:"وضعَتْ {N} علامةً بين الصفحات، وأغلقَتْ كتابَها، ورفعَتْ رأسَها تنظرُ إلى الأب."},
  s2g:{w:"dad",b:"كان الجملُ يمشي في الرمالِ وحدَه، ولا يلعبُ معه أحد."},
  s2h:{w:"dad",b:"وفي يومٍ حارٍّ، رأى صغارَ الغزلانِ عطشى، فحملَهم على ظهرِه إلى الواحة."},
  s2i:{w:"dad",b:"شربَ الصغارُ الماءَ البارد، وشكروا الجملَ، ودعَوه ليلعبَ معهم."},
  s2e:{w:"dad",b:"…وفي النهاية، ضحكَ الجملُ وصارَ صديقًا للجميع!"},
  s2f:{w:"bro",b:"قصّةٌ رائعة!"},
  m2:{w:"narrator",b:"ابتسمَ الأبُ ابتسامةً واسعة، ولمعَتْ عيناه."},
  l2a:{w:"narrator",b:"بعدَ الحكاية، نهضَ الأبُ إلى كيسَيْن قربَ بابِ ساحةِ البيت، فحملَ أحدَهما وفتحَ الباب."},
  l2b:{w:"narrator",b:"لاحظَ {N} الكيسَ الصغيرَ المتبقّي.",g:"لاحظَتْ {N} الكيسَ الصغيرَ المتبقّي."},
  /* المشهد 3 */
  s3a:{w:"narrator",b:"خرجَ {N} إلى ساحةِ البيت، فالتفتَ الأبُ نحوَ الكيسِ الصغير.",g:"خرجَتْ {N} إلى ساحةِ البيت، فالتفتَ الأبُ نحوَ الكيسِ الصغير."},
  s3b:{w:"narrator",b:"حملَ {N} الكيسَ الصغير، ومشى بجانبِ الأب؛ كلٌّ منهما يحملُ كيسًا واحدًا.",g:"حملَتْ {N} الكيسَ الصغير، ومشَتْ بجانبِ الأب؛ كلٌّ منهما يحملُ كيسًا واحدًا."},
  s3c:{w:"dad",b:"شكرًا لمساعدتِكَ يا ابني!",g:"شكرًا لمساعدتِكِ يا ابنتي!"},
  m3:{w:"narrator",b:"تنفَّسَ الأبُ براحة، ومسحَ جبينَه مبتسمًا."},
  l3a:{w:"narrator",b:"أغلقَ الأبُ غطاءَ الحاوية، وفجأةً سُمِعَ صوت…"},
  l3b:{w:"bro",b:"ووووووش!"},
  l3c:{w:"narrator",b:"التفتَ {N} نحوَ الحديقة، فرأى طائرةً برتقاليةً على المقعد.",g:"التفتَتْ {N} نحوَ الحديقة، فرأَتْ طائرةً برتقاليةً على المقعد."},
  /* المشهد 4 */
  s4a:{w:"narrator",b:"أمسكَ {N} الطائرة، وحرَّكَها في الهواء، والأخُ الصغيرُ يتبعُها بعينيه.",g:"أمسكَتْ {N} الطائرة، وحرَّكَتْها في الهواء، والأخُ الصغيرُ يتبعُها بعينيه."},
  s4b:{w:"bro",b:"هل جاءَ دوري؟"},
  s4c:{w:"narrator",b:"أمسكَ الأخُ الصغيرُ الطائرة، ورفعَها عاليًا، وجرى بها فرحًا."},
  m4:{w:"narrator",b:"قفزَ الأخُ الصغيرُ وضحكَ عاليًا، وطائرتُه تُحلِّقُ فوقَ رأسِه."},
  l4a:{w:"narrator",b:"عادَ الأخُ إلى البيتِ يُحلِّقُ بطائرتِه، ودخلَ {N} خلفَه.",g:"عادَ الأخُ إلى البيتِ يُحلِّقُ بطائرتِه، ودخلَتْ {N} خلفَه."},
  /* المشهد 5 */
  s5a:{w:"narrator",b:"جلسَتِ الأمُّ على الكرسيِّ أمامَ المرآة، تنظرُ إلى شعرِها."},
  s5b:{w:"narrator",b:"لاحظَ {N} المِشطَ على الطاولة.",g:"لاحظَتْ {N} المِشطَ على الطاولة."},
  s5c:{w:"char",v:1,b:"أساعدُكِ يا أمّي؟"},
  s5d:{w:"narrator",b:"هزَّتِ الأمُّ رأسَها مبتسمة."},
  s5e:{w:"narrator",b:"رتَّبَ {N} شعرَ الأمّ بلطف، فنظرَتِ الأمُّ إلى المرآة، ثمّ أمسكَتْ يدَه.",g:"رتَّبَتْ {N} شعرَ الأمّ بلطف، فنظرَتِ الأمُّ إلى المرآة، ثمّ أمسكَتْ يدَها."},
  s5f:{w:"mom",b:"ما ألطفَكَ يا ابني!",g:"ما ألطفَكِ يا ابنتي!"},
  m5:{w:"narrator",b:"أشرقَ وجهُ الأمّ، وضمَّتْ يدَ {N} إلى قلبِها.",ab:"أشرقَ وجهُ الأمّ، وضمَّتْ يدَ بطلِنا إلى قلبِها.",ag:"أشرقَ وجهُ الأمّ، وضمَّتْ يدَ بطلتِنا إلى قلبِها."},
  l5a:{w:"narrator",b:"نظرَ {N} إلى الألبوم، فوجدَ إطارًا واحدًا فارغًا.",g:"نظرَتْ {N} إلى الألبوم، فوجدَتْ إطارًا واحدًا فارغًا."},
  l5b:{w:"char",v:1,b:"بقيَتْ صورةٌ واحدة! أريدُ أن أُرِيَكِ أحبَّ لحظةٍ عندي."},
  l5c:{w:"narrator",b:"جاءَ المساء، وحملَ {N} الألبومَ إلى الأمّ.",g:"جاءَ المساء، وحملَتْ {N} الألبومَ إلى الأمّ."},
  /* المشهد 6 */
  s6a:{w:"char",v:1,b:"أمّي، أريدُ أن أحكيَ لكِ عن صورة."},
  s6b:{w:"narrator",b:"وضعَتِ الأمُّ قطعةَ القماشِ جانبًا، والتفتَتْ إليه.",g:"وضعَتِ الأمُّ قطعةَ القماشِ جانبًا، والتفتَتْ إليها."},
  s6c:{w:"narrator",b:"اختارَ {N} صورتَه المفضَّلة، ووضعَها في الصفحةِ أمامَ الأمّ.",g:"اختارَتْ {N} صورتَها المفضَّلة، ووضعَتْها في الصفحةِ أمامَ الأمّ."},
  s6d:{w:"narrator",b:"نظرَتِ الأمُّ إلى الصورة، ثمّ اقتربَتْ حتّى صارَتْ عيناها في مستوى عينيه.",g:"نظرَتِ الأمُّ إلى الصورة، ثمّ اقتربَتْ حتّى صارَتْ عيناها في مستوى عينيها."},
  s6e:{w:"mom",b:"أنا أسمعُكَ يا ابني. احكِ لي عنها.",g:"أنا أسمعُكِ يا ابنتي. احكي لي عنها."},
  s6f:{w:"narrator",b:"ارتاحَتْ كتفا {N}، وبدأَ يحكي للأمّ عن صورتِه.",g:"ارتاحَتْ كتفا {N}، وبدأَتْ تحكي للأمّ عن صورتِها.",ab:"ارتاحَتْ كتفا بطلِنا، وبدأَ يحكي للأمّ عن صورتِه.",ag:"ارتاحَتْ كتفا بطلتِنا، وبدأَتْ تحكي للأمّ عن صورتِها."},
  m6:{w:"narrator",b:"ابتسمَ {N}، وأكملَ حكايتَه بصوتٍ واثق.",g:"ابتسمَتْ {N}، وأكملَتْ حكايتَها بصوتٍ واثق."},
  e01:{w:"narrator",b:"وهكذا اكتملَ الألبومُ بستِّ لحظاتٍ جميلة."},
  e02:{w:"narrator",b:"هذه حكايةُ {N} مع أسرتِه… يومٌ صنعوه معًا بالحبِّ والتقدير.",g:"هذه حكايةُ {N} مع أسرتِها… يومٌ صنعوه معًا بالحبِّ والتقدير.",ab:"هذه حكايةُ بطلِنا مع أسرتِه… يومٌ صنعوه معًا بالحبِّ والتقدير.",ag:"هذه حكايةُ بطلتِنا مع أسرتِها… يومٌ صنعوه معًا بالحبِّ والتقدير."},
  /* أسئلة استنتاج الأثر بعد كل مشهد */
  q1:{w:"narrator",b:"قبَّلَ {N} يدَ الأمّ. ما أثرُ ذلك في الأمّ؟ (كيف شعرَتْ؟)",g:"قبَّلَتْ {N} يدَ الأمّ. ما أثرُ ذلك في الأمّ؟ (كيف شعرَتْ؟)",ab:"قبَّلَ البطلُ يدَ الأمّ. ما أثرُ ذلك في الأمّ؟ كيف شعرَتْ؟",ag:"قبَّلَتِ البطلةُ يدَ الأمّ. ما أثرُ ذلك في الأمّ؟ كيف شعرَتْ؟"},
  q2:{w:"narrator",b:"استمعَ {N} إلى حكايةِ الأب. ما أثرُ ذلك في الأب؟ (كيف شعرَ؟)",g:"استمعَتْ {N} إلى حكايةِ الأب. ما أثرُ ذلك في الأب؟ (كيف شعرَ؟)",ab:"استمعَ البطلُ إلى حكايةِ الأب. ما أثرُ ذلك في الأب؟ كيف شعرَ؟",ag:"استمعَتِ البطلةُ إلى حكايةِ الأب. ما أثرُ ذلك في الأب؟ كيف شعرَ؟"},
  q3:{w:"narrator",b:"حملَ {N} الكيسَ مع الأب. ما أثرُ ذلك في الأب؟ (كيف شعرَ؟)",g:"حملَتْ {N} الكيسَ مع الأب. ما أثرُ ذلك في الأب؟ (كيف شعرَ؟)",ab:"حملَ البطلُ الكيسَ مع الأب. ما أثرُ ذلك في الأب؟ كيف شعرَ؟",ag:"حملَتِ البطلةُ الكيسَ مع الأب. ما أثرُ ذلك في الأب؟ كيف شعرَ؟"},
  q4:{w:"narrator",b:"أعطى {N} الطائرةَ للأخِ الصغير. ما أثرُ ذلك في الأخ؟ (كيف شعرَ؟)",g:"أعطَتْ {N} الطائرةَ للأخِ الصغير. ما أثرُ ذلك في الأخ؟ (كيف شعرَ؟)",ab:"أعطى البطلُ الطائرةَ للأخِ الصغير. ما أثرُ ذلك في الأخ؟ كيف شعرَ؟",ag:"أعطَتِ البطلةُ الطائرةَ للأخِ الصغير. ما أثرُ ذلك في الأخ؟ كيف شعرَ؟"},
  q5:{w:"narrator",b:"ساعدَ {N} الأمَّ في ترتيبِ شعرِها. ما أثرُ ذلك في الأمّ؟ (كيف شعرَتْ؟)",g:"ساعدَتْ {N} الأمَّ في ترتيبِ شعرِها. ما أثرُ ذلك في الأمّ؟ (كيف شعرَتْ؟)",ab:"ساعدَ البطلُ الأمَّ في ترتيبِ شعرِها. ما أثرُ ذلك في الأمّ؟ كيف شعرَتْ؟",ag:"ساعدَتِ البطلةُ الأمَّ في ترتيبِ شعرِها. ما أثرُ ذلك في الأمّ؟ كيف شعرَتْ؟"},
  q6:{w:"narrator",b:"استمعَتِ الأمُّ إلى {N}. ما أثرُ ذلك في {N}؟ (كيف شعرَ؟)",g:"استمعَتِ الأمُّ إلى {N}. ما أثرُ ذلك في {N}؟ (كيف شعرَتْ؟)",ab:"استمعَتِ الأمُّ إلى البطل. ما أثرُ ذلك في البطل؟ كيف شعرَ؟",ag:"استمعَتِ الأمُّ إلى البطلة. ما أثرُ ذلك في البطلة؟ كيف شعرَتْ؟"},
  /* سؤال إثرائي اختياري في الختام (لا يدخل في الدرجة) */
  x1:{w:"narrator",b:"ماذا تفعلُ أنتَ غدًا لتُقدِّرَ أسرتَك؟",g:"ماذا تفعلينَ أنتِ غدًا لتُقدِّري أسرتَكِ؟"},
  /* خانة المساعدة: ثلاث عبارات بالأسلوب نفسه (a هي العبارة المناسبة) */
  h1a:{w:"narrator",b:"فرحَتِ الأمُّ، وشعرَتْ بالحبِّ والتقدير."},h1b:{w:"narrator",b:"غضبَتِ الأمُّ، وأدارَتْ وجهَها."},h1c:{w:"narrator",b:"خافَتِ الأمُّ، وسحبَتْ يدَها."},
  h2a:{w:"narrator",b:"فرحَ الأبُ، وشعرَ بأنَّ لكلامِه قيمة."},h2b:{w:"narrator",b:"حزنَ الأبُ، وتوقَّفَ عن الحكاية."},h2c:{w:"narrator",b:"غضبَ الأبُ، وخرجَ من الغرفة."},
  h3a:{w:"narrator",b:"ارتاحَ الأبُ، وخفَّ الحِملُ عنه."},h3b:{w:"narrator",b:"تعبَ الأبُ، وحملَ الكيسَيْن وحدَه."},h3c:{w:"narrator",b:"انزعجَ الأبُ، وتركَ الكيسَ في ساحةِ البيت."},
  h4a:{w:"narrator",b:"فرحَ الأخُ، ولعبَ بالطائرةِ أيضًا."},h4b:{w:"narrator",b:"حزنَ الأخُ، وبكى لأنَّه لم يلعبْ."},h4c:{w:"narrator",b:"غضبَ الأخُ، وكسرَ الطائرة."},
  h5a:{w:"narrator",b:"فرحَتِ الأمُّ، وشعرَتْ بالاهتمام."},h5b:{w:"narrator",b:"حزنَتِ الأمُّ، ورتَّبَتْ شعرَها وحدَها."},h5c:{w:"narrator",b:"انزعجَتِ الأمُّ، وأبعدَتِ المِشط."},
  h6a:{w:"narrator",b:"ارتاحَ {N}، وأكملَ حكايتَه.",g:"ارتاحَتْ {N}، وأكملَتْ حكايتَها.",ab:"ارتاحَ البطلُ، وأكملَ حكايتَه.",ag:"ارتاحَتِ البطلةُ، وأكملَتْ حكايتَها."},
  h6b:{w:"narrator",b:"حزنَ {N}، وتوقَّفَ عن الكلام.",g:"حزنَتْ {N}، وتوقَّفَتْ عن الكلام.",ab:"حزنَ البطلُ، وتوقَّفَ عن الكلام.",ag:"حزنَتِ البطلةُ، وتوقَّفَتْ عن الكلام."},
  h6c:{w:"narrator",b:"خجلَ {N}، وأخفى الصورة.",g:"خجلَتْ {N}، وأخفَتِ الصورة.",ab:"خجلَ البطلُ، وأخفى الصورة.",ag:"خجلَتِ البطلةُ، وأخفَتِ الصورة."},
  u_helpq:{w:"narrator",b:"أيُّ عبارةٍ تساعدُكَ على الإجابة؟",g:"أيُّ عبارةٍ تساعدُكِ على الإجابة؟"},
  u_now:{w:"narrator",b:"الآنَ عبِّرْ بكلماتِك.",g:"الآنَ عبِّري بكلماتِكِ."},
  u_oral:{w:"narrator",b:"أخبِرْ معلِّمَكَ بما تفكِّرُ فيه.",g:"أخبِري معلِّمَكِ بما تفكِّرينَ فيه."},
  u_good:{w:"narrator",b:"أحسنْتَ التعبيرَ عن فكرتِك!",g:"أحسنْتِ التعبيرَ عن فكرتِكِ!"},
  u_retry:{w:"narrator",b:"تأمَّلِ اللقطةَ مرّةً أخرى. ماذا تغيَّرَ بعدَ ما فعلَه {N}؟",g:"تأمَّلي اللقطةَ مرّةً أخرى. ماذا تغيَّرَ بعدَ ما فعلَتْه {N}؟",ab:"تأمَّلِ اللقطةَ مرّةً أخرى. ماذا تغيَّرَ بعدَ ما فعلَه البطل؟",ag:"تأمَّلي اللقطةَ مرّةً أخرى. ماذا تغيَّرَ بعدَ ما فعلَتْه البطلة؟"}
};
/* ترتيب عرض عبارات المساعدة في كل مشهد (حتى لا تكون العبارة المناسبة في المكان نفسه دائمًا) */
const HORD={1:"bac",2:"cab",3:"acb",4:"bca",5:"cba",6:"abc"};
const isGendered=L=>!!(L.v||L.ab||L.ag||(L.g&&L.g!==L.b)||/\{N\}/.test(L.b));
function lineInfo(id){
  const L=SCRIPT[id],gi=CHAR.g==="girl",raw=(gi?(L.g||L.b):L.b),fb=gi?"بطلتُنا":"بطلُنا";
  const audio=(gi?L.ag:L.ab)||raw.replace(/\{N\}/g,fb);const nm=NAME();
  const text=nm?raw.replace(/\{N\}/g,nm):audio;
  return{who:L.w,text,audio,clip:isGendered(L)?id+(gi?"_g":"_b"):id};
}
function line(id){const I=lineInfo(id);return say(I.who,I.text,I.clip,I.audio)}
function vline(id){const I=lineInfo(id);return voice(I.audio,I.clip)}

/* ---------------- small helpers ---------------- */
function addEnt(id,o){ent(id,o);drawMid()}
function anim(id,cls,ms=1400){set(id,{anim:cls});setTimeout(()=>{const e=R.ents[id];if(e&&e.anim===cls){e.anim="";DIRTY.add(id)}},ms/SPEED)}
function walk(id,toX,dur,face=true){const e=R.ents[id];if(face)set(id,{flip:toX<e.x});const n=Math.max(2,Math.round(Math.abs(toX-e.x)/70));let last=-1;
  return tw(id,{x:toX},dur,LIN,(e,p)=>{e.step=p>=1?0:Math.sin(p*Math.PI*n);const s=Math.floor(p*n);if(s!==last){last=s;SFX.step()}})}
function hopTo(id,x,y,dur=600){return tw(id,{x,y},dur,EIO,(e,p)=>{e.bob=p>=1?0:-Math.sin(p*Math.PI)*60})}
async function armTo(id,side,target,dur=600,ease=EIO){const e=R.ents[id],k="arm"+side;let tgt=target,name=null;
  if(typeof target==="string"){const prev=e[k];e[k]=target;tgt=handWorld(e,side);e[k]=prev;name=target}
  await tw(id,{[k]:tgt},dur,ease);if(name)set(id,{[k]:name})}
function swing(id){return tw(id,{},900,LIN,(e,p)=>{e.rot=p>=1?0:Math.sin(p*Math.PI*5)*16*(1-p)})}
function stripPulse(){const s=$("#strip");s.classList.add("pulse");setTimeout(()=>s.classList.remove("pulse"),3200)}
function face(id){return partWorld(R.ents[id],100,98)}
function toFront(id){const i=R.order.indexOf(id);if(i>=0){R.order.splice(i,1);R.order.push(id);drawMid()}}
async function cut(build,dur=450){
  const t=document.createElement("div");t.className="trans";
  t.innerHTML=(farW.outerHTML+midW.outerHTML+nearW.outerHTML).replace(/\sid="(e_[^"]*|far|mid|near|farW|midW|nearW)"/g,"");
  UIL.prepend(t);build();drawMid();await wait(80);
  t.style.transitionDuration=Math.round(dur/SPEED)+"ms";t.style.opacity="0";await wait(dur);t.remove();
}
function snap(){return{ents:JSON.parse(JSON.stringify(R.ents)),order:R.order.slice(),cam:{...CAM},set:R.set,tint:$("#tint").classList.contains("on")}}
function restore(s){R.ents=JSON.parse(JSON.stringify(s.ents));R.order=s.order.slice();if(R.set!==s.set)useSet(s.set);$("#tint").classList.toggle("on",s.tint);drawMid();cam(s.cam.cx,s.cam.cy,s.cam.z,0)}
const kid=o=>({t:"actor",cfg:"char",s:1.45,pose:"stand",armL:"down",armR:"down",mood:"happy",gx:0,gy:0,...o});
const momE=o=>({t:"actor",cfg:"momH",s:1.55,pose:"sit",armL:"lap",armR:"lap",mood:"smile",...o});
const dadE=o=>({t:"actor",cfg:"dad",s:1.55,pose:"sit",armL:"lap",armR:"lap",mood:"smile",...o});
const broE=o=>({t:"actor",cfg:"bro",s:1.12,pose:"stand",armL:"down",armR:"down",mood:"happy",...o});

/* emotion badge above the character whose feeling changed */
async function emo(id,k,side){const e=R.ents[id];if(!e)return;const f=face(id),sc=(e.s||1.5)/1.5,dir=side||(e.flip?1:-1);
  addEnt("emo_"+id,{t:"emo",k,x:f[0]+dir*(side?135:100)*sc,y:f[1]-(side?55:118)*sc,s:.35*sc,alpha:0,flip:dir<0});SFX.magic();
  await tw("emo_"+id,{s:1.08*sc,alpha:1},360,EO);await tw("emo_"+id,{s:sc},180,EIO)}
function clearEmo(){Object.keys(R.ents).filter(k=>k.startsWith("emo_")).forEach(k=>set(k,{hidden:true}))}

/* trail + brother's eyes follow the plane */
FRAMEHOOKS.push(()=>{
  const t=R.ents.trail;if(t){if(t.src&&R.ents[t.src]){const p=R.ents[t.src];t.pts=(t.pts||[]);t.pts.push([p.x,p.y]);if(t.pts.length>22)t.pts.shift();DIRTY.add("trail")}else if(t.pts&&t.pts.length){t.pts.shift();DIRTY.add("trail")}}
  if(R.track&&R.ents.bro&&R.ents.plane){const b=R.ents.bro,p=R.ents.plane;const dir=b.flip?-1:1;b.gx=clamp((p.x-b.x)/160*dir,-1,1);b.gy=clamp((p.y-(b.y-230))/160,-1,1);DIRTY.add("bro")}
});

/* ---------------- speech & captions ---------------- */
function portrait(who){
  if(who==="narrator")return `<svg viewBox="-104 -104 208 208">${flowerG(1)}</svg>`;
  const e=R.ents[who];const c=who==="char"?charCfg():who==="mom"?LOOK[e&&e.cfg==="momR"?"momR":"momH"]:LOOK[who];
  return `<svg viewBox="28 16 144 144">${avatar(c,{mood:"smile"}).svg}</svg>`;
}
function storyPanel(){panelEl.innerHTML=`<div class="cap"><div class="who" id="pWho"></div><div><span class="chip" id="pName"></span><p class="line" id="pLine"> </p></div></div><div class="phint" id="pHint" hidden></div>`}
function caption(who,text){
  if(CUR.mode==="ask"||CUR.mode==="end"){subtitle(text);return}
  if(!$("#pLine"))storyPanel();const sp=SPK[who];panelEl.style.setProperty("--c",sp.c);
  $("#pWho").innerHTML=portrait(who);$("#pName").textContent=sp.n();const l=$("#pLine");l.textContent=text;l.classList.remove("enter");void l.offsetWidth;l.classList.add("enter");
}
function subtitle(text){let s=UIL.querySelector(".subt");if(!s){s=document.createElement("div");s.className="subt";UIL.appendChild(s)}s.textContent=text;clearTimeout(subtitle.t);subtitle.t=setTimeout(()=>s.remove(),Math.max(2200,text.length*80)/SPEED)}
function panelHint(t){const h=$("#pHint");if(!h)return;h.hidden=!t;h.textContent=t?"👆 "+t:""}
async function say(who,text,id,audio){
  const my=RUN;caption(who,text);const e=R.ents[who];if(e&&e.t==="actor"){e.talk=true;DIRTY.add(who)}
  const pitch={bro:1.4,char:1.25,dad:.85,mom:1.1}[who]||1;
  await Promise.all([voice(audio||text,id,pitch),wait(Math.max(1500,750+text.length*58))]);
  if(my!==RUN)throw ABORT;
  if(e){e.talk=false;DIRTY.add(who)}
}

/* ---------------- album strip & controls ---------------- */
function renderStrip(){
  $("#strip").innerHTML=[1,2,3,4,5,6].map(k=>{const ph=PHOTOS[k],ev=ST[k].ev;
    return `<button class="frame ${ph?"has":""} ${ev==="correct"?"ok":""}" style="--c:${PC[k-1]}" data-k="${k}" aria-label="الإطار ${ar(k)}${ph?"، اضغط لإعادة مشاهدة اللحظة":""}">${ph?ph.svg:""}<span class="n">${ar(k)}</span></button>`}).join("");
}
$("#strip").addEventListener("click",e=>{const f=e.target.closest(".frame");if(f&&PHOTOS[+f.dataset.k])viewer(+f.dataset.k)});
const IC={pause:`<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="#FF6F61"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#FF6F61"/></svg>`,play:`<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" fill="#16B3A6"/></svg>`,
  snd:`<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#8A63FF"/><path d="M16 8q3 4 0 8M18.5 5.5q5 6.5 0 13" stroke="#8A63FF" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  mute:`<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#A49CC2"/><path d="M16 9l5 6M21 9l-5 6" stroke="#A49CC2" stroke-width="2" stroke-linecap="round"/></svg>`};
function setPause(p){PAUSED=p;document.body.classList.toggle("paused",p);$("#bPause").innerHTML=p?IC.play:IC.pause;$("#bPause").setAttribute("aria-label",p?"تشغيل":"إيقاف مؤقّت");
  try{p?speechSynthesis.pause():speechSynthesis.resume()}catch(e){}if(curAudio){p?curAudio.pause():curAudio.play().catch(()=>{})}
  UIL.querySelectorAll(".pausemark").forEach(n=>n.remove());if(p){const m=document.createElement("div");m.className="pausemark";m.innerHTML="<span>⏸ متوقّف</span>";UIL.appendChild(m)}}
$("#bPause").onclick=()=>{SFX.tap();setPause(!PAUSED)};
$("#bMute").onclick=e=>{S.mute=!S.mute;if(S.mute)stopVoice();e.currentTarget.innerHTML=S.mute?IC.mute:IC.snd;e.currentTarget.setAttribute("aria-pressed",S.mute)};
$("#bReplay").onclick=()=>{SFX.tap();if(PAUSED)setPause(false);replay()};
$("#bTeach").onclick=()=>{SFX.tap();teacherMenu()};
$("#bPause").innerHTML=IC.pause;$("#bMute").innerHTML=IC.snd;

const CREDITS=`<div class="credits"><b>مِنْ إِعْدَادِ:</b><ul><li>رُقَيّة عَبْد الجَليل رمضان — <span class="id">202006381</span></li><li>سَارَة أَحْمَد العلي — <span class="id">202201738</span></li><li>عائِشة عِماد الدين — <span class="id">202203394</span></li><li>رِيم صَلاح عَوَض — <span class="id">202207161</span></li><li>فَاطِمَة فَائق جَعْفَر — <span class="id">202207320</span></li></ul><p>الشُّعْبَة: السّادِسَة<span class="sep">·</span>بِإِشْرَافِ: د. فؤاد جعفر</p></div>`;
/* ---------------- cover ---------------- */
function coverPanel(){
  panelEl.style.setProperty("--c","#FF6F61");
  panelEl.innerHTML=`<div class="coverp enter"><h1>ألبوم أُسرتي</h1><p>يومٌ نصنعه معًا: نصمّم شخصيتنا، ونعيش يومًا مع الأسرة، ونحتفظ بستّ لحظات في الألبوم.</p></div>
    <div class="row"><button class="btn big coral" id="pStart">ابدأ حكايتي ▸</button></div>
    ${CREDITS}
    <p class="teachnote">👩‍🏫 للمعلّم: يتنقّل الصفّ بين المشاهد بزرّ «نتابع الحكاية» بعد تقييمك، ويمكنك القفز إلى أيّ مشهد من قائمة المعلّم في الأعلى.</p>`;
  $("#pStart").onclick=startStory;
}
/* ---------------- cover & page counter (e-book style) ---------------- */
function setPg(k){const el=$("#pg");if(el)el.textContent=k===0?"الغلاف":`صفحة ${ar(k)} من ${ar(8)}`}
function showCover(){
  abortAll();closeOv();CUR={mode:"cover",n:0};clearEnts();useSet("cover");drawMid();$("#tint").classList.remove("on");cam(800,450,1,0);coverPanel();renderStrip();setPg(0);
  UIL.querySelectorAll(".startbtn").forEach(n=>n.remove());
  const b=document.createElement("button");b.className="btn big coral startbtn";b.textContent="ابدأ حكايتي ▸";b.onclick=startStory;UIL.appendChild(b);
}
async function startStory(){
  if(startStory.busy)return;startStory.busy=true;
  abortAll();try{SFX.magic();UIL.querySelectorAll(".startbtn").forEach(n=>n.remove());
    await pageSlide(()=>{setupCreator();cam(700,450,1.3,0)});CUR={mode:"creator",n:0};creatorPanel();setPg(1);
    vline("c01");
  }catch(e){if(e!==ABORT)report(e)}finally{startStory.busy=false}
}

/* ---------------- character builder ---------------- */
let CTAB="me";
function setupCreator(){clearEnts();useSet("kidroom");$("#tint").classList.remove("on");ent("kmirror",{t:"kmirror",x:640,y:400,armR:"down"});cam(640,438,3.4,0)}
function sw(list,cur,key){return list.map(([nm,hex],i)=>`<button class="sw" style="background:${hex}" aria-label="${nm}" aria-pressed="${cur===i}" data-k="${key}" data-v="${i}"></button>`).join("")}
function chips(list,cur,key){return list.map(([v,nm])=>`<button class="ch" aria-pressed="${cur===v}" data-k="${key}" data-v="${v}">${nm}</button>`).join("")}
function creatorPanel(){
  panelEl.style.setProperty("--c","#16B3A6");
  const T=[["me","👤","أنا"],["face","🙂","الوجه"],["hair","💇","الشعر"],["wear","👕","الملابس"],["acc","🕶️","الإضافات"]];
  let body="";
  if(CTAB==="me")body=`<div class="opt"><h3>${G("أنا ولد","أنا بنت")}</h3><div class="chips">${chips([["boy","👦 ولد"],["girl","👧 بنت"]],CHAR.g,"g")}</div></div>
    <div class="opt"><h3>اسمي (اختياري)</h3><input class="namein" id="nameIn" maxlength="14" placeholder="${G("اكتب اسمك","اكتبي اسمكِ")}" value="${esc(CHAR.name)}"></div>`;
  if(CTAB==="face")body=`<div class="opt"><h3>لون البشرة</h3><div class="chips">${sw(SKINS,CHAR.skin,"skin")}</div></div><div class="opt"><h3>لون العينين</h3><div class="chips">${sw(EYES,CHAR.eye,"eye")}</div></div>`;
  if(CTAB==="hair")body=`<div class="opt"><h3>التسريحة</h3><div class="chips">${chips(HAIRS,CHAR.hair,"hair")}</div></div><div class="opt"><h3>لون الشعر</h3><div class="chips">${sw(HAIRC,CHAR.hairC,"hairC")}</div></div>`;
  if(CTAB==="wear")body=`<div class="opt"><h3>شكل اللباس</h3><div class="chips">${chips(OUTFITS,CHAR.outfit,"outfit")}</div></div><div class="opt"><h3>اللون</h3><div class="chips">${sw(OUTC,CHAR.outC,"outC")}</div></div>`;
  if(CTAB==="acc")body=`<div class="opt"><h3>الإكسسوارات</h3><div class="chips"><button class="ch" data-k="cap" aria-pressed="${CHAR.cap}">🧢 قبّعة</button><button class="ch" data-k="band" aria-pressed="${CHAR.band}">🎀 ربطة شعر</button><button class="ch" data-k="watch" aria-pressed="${CHAR.watch}">⌚ ساعة</button></div></div>
    <div class="opt"><h3>النظّارة</h3><div class="chips">${chips(GLASSES,CHAR.glasses,"glasses")}</div></div>${CHAR.glasses!=="none"?`<div class="opt"><h3>لون النظّارة</h3><div class="chips">${sw(GLC,CHAR.glC,"glC")}</div></div>`:""}
    <div class="row"><button class="btn sm ghost" data-k="clearAcc">إزالة الإضافات</button></div>`;
  panelEl.innerHTML=`<p class="ctitle">${G("كيف تحبّ أن تظهر في حكايتك؟","كيف تحبّين أن تظهري في حكايتكِ؟")}</p>
    <div class="tabs" role="tablist">${T.map(([k,i,nm])=>`<button class="tab" role="tab" aria-selected="${CTAB===k}" data-tab="${k}"><span class="ti">${i}</span>${nm}</button>`).join("")}</div>
    <div class="enter" style="display:flex;flex-direction:column;gap:10px">${body}</div>
    <div class="row" style="margin-top:4px"><button class="btn big turq" id="cDone">هذه شخصيّتي ✓</button></div>`;
  const ni=$("#nameIn");if(ni)ni.addEventListener("input",()=>{CHAR.name=ni.value});
  $("#cDone").onclick=creatorDone;
}
panelEl.addEventListener("click",e=>{
  if(CUR.mode!=="creator")return;const t=e.target.closest("[data-tab]");
  if(t){SFX.tap();CTAB=t.dataset.tab;creatorPanel();if(CTAB!=="face")cam(700,450,1.3,700).catch(()=>{});return}
  const b=e.target.closest("[data-k]");if(!b)return;const k=b.dataset.k,v=b.dataset.v;SFX.pop();
  if(k==="g"){if(CHAR.g!==v){const nm=CHAR.name;CHAR=defaultChar(v);CHAR.name=nm}}
  else if(["skin","eye","hairC","outC","glC"].includes(k)){CHAR[k]=+v}
  else if(["hair","outfit","glasses"].includes(k)){CHAR[k]=v}
  else if(["cap","band","watch"].includes(k)){CHAR[k]=!CHAR[k]}
  else if(k==="clearAcc"){CHAR.cap=CHAR.band=CHAR.watch=false;CHAR.glasses="none"}
  DIRTY.add("kmirror");if(R.ents.char)DIRTY.add("char");creatorPanel();
  if(k==="eye")cam(640,438,3.1,700).catch(()=>{});else if(k==="skin")cam(700,450,1.3,700).catch(()=>{});
});
async function creatorDone(){
  abortAll();CUR={mode:"scene",n:0};storyPanel();
  try{
    await cam(820,470,1.15,900);
    addEnt("char",kid({x:640,y:672,s:1.32,alpha:1}));SFX.magic();fx("✨",640,480,8);
    await tw("char",{x:900,y:830,s:1.45},900,EO);
    set("char",{handR:"open",mood:"happy"});
    for(let i=0;i<3;i++){await armTo("char","R","wave",260);await armTo("char","R","up",260)}
    await armTo("char","R","down",300);set("char",{handR:null});
    await line("c02");
    await line("c03");
    set("char",{gx:1,mood:"smile"});anim("char","a-squash",400);
    await Promise.all([line("c04"),walk("char",1780,2400),cam(1250,470,1.25,2400)]);
    await cut(setup1,500);
    await sceneBody(1);
  }catch(e){if(e!==ABORT)report(e)}
}

/* ---------------- scenes ---------------- */
const SC={};
/* 1 — صباح الخير يا أمّي */
function setup1(){
  clearEnts();useSet("living");$("#tint").classList.remove("on");
  ent("door",{t:"door",x:1468,y:648,open:0});ent("bagA",{t:"bag",x:1380,y:712,s:1});ent("bagB",{t:"bag",x:1440,y:735,s:.75});
  ent("sbook",{t:"book",x:1110,y:585,s:.75,open:0,c:"#8A63FF"});
  ent("dad",dadE({x:960,y:805,gx:-.2}));ent("mom",momE({x:640,y:805}));
  ent("album",{t:"album",x:672,y:612,s:.55,open:0});
  ent("char",kid({x:-140,y:815}));
  cam(800,450,1,0);
}
SC[1]={
  setup:setup1,
  async intro(){
    await Promise.all([line("s1a"),walk("char",430,2600)]);
    set("mom",{flip:true});anim("mom","a-squash",400);
    await Promise.all([line("s1e"),cam(560,520,1.7,1300),armTo("mom","R",[578,598],900)]);set("mom",{handR:"open"});
    await line("s1f");
  },
  async interact(){
    hint(G("المسْ يدَ الأمّ لتُحيّيَها","المسي يدَ الأمّ لتُحيّيها"));
    const h=handWorld(R.ents.mom,"R");await waitTap(h[0],h[1],"يد الأم",56);
  },
  async react(replay){
    hint(null);
    const k1=line("s1g");await walk("char",495,500);set("char",{pose:"kneel",flip:false});anim("char","a-squash",400);
    await Promise.all([tw("char",{lean:14},600),armTo("char","R",[583,602],600)]);
    set("char",{handR:"fist",mood:"love"});SFX.kiss();fx("♥",590,520,7);
    set("mom",{mood:"love"});const sp=partWorld(R.ents.char,134,170);
    await Promise.all([tw("mom",{lean:10},600),armTo("mom","L",[sp[0]+8,sp[1]+4],700)]);set("mom",{handL:"open"});
    await k1;await line("s1h");
    const f=face("mom");await cam(f[0],f[1]+30,2.5,1100);set("mom",{mood:"happy"});
    await Promise.all([line("m1"),emo("mom","love")]);await wait(500);
    await cam(580,520,1.7,1000);
    const kiss=photoSVG();
    set("char",{pose:"stand",lean:0,armR:"down",handR:null,mood:"happy"});
    await Promise.all([tw("mom",{lean:0},500),armTo("mom","L","lap",500),armTo("mom","R","lap",500)]);set("mom",{flip:false,handR:null,handL:null});
    clearEmo();
    attach("album","mom","R",0,-4);const nb=line("s1b");await armTo("mom","R",[772,700],900);detach("album");set("album",{x:772,y:700});
    await armTo("mom","R","lap",500);
    await cam(760,650,2.3,1100);set("album",{open:1});SFX.page();stripPulse();await nb;
    set("mom",{flip:true,gx:1});await cam(600,500,1.6,900);
    await line("s1c");
    set("char",{mood:"laugh"});await line("s1d");set("char",{mood:"happy"});
    set("mom",{flip:false,gx:0});
    if(!replay)await capture(1,kiss);
  },
  async shot(){await cam(585,470,1.9,900)},
  async link(){
    set("char",{pose:"stand",lean:0,armR:"down",handR:null,mood:"happy"});
    await Promise.all([tw("mom",{lean:0},500),armTo("mom","L","lap",500),armTo("mom","R","lap",500)]);set("mom",{flip:false,handR:null,handL:null,mood:"smile"});
    await cam(1000,560,1.7,1100);
    const la=line("l1a");await armTo("dad","R",[1108,588],800);attach("sbook","dad","R",0,10);SFX.page();
    await armTo("dad","R","lap",700);set("sbook",{open:1});
    await la;await line("l1b");
    set("char",{gx:1,tilt:-6});set("mom",{gx:1});
    await cam(800,470,1.05,1800);
    set("char",{tilt:0,gx:0});const lc=line("l1c");await walk("char",470,900);
    set("char",{pose:"floor",y:862,s:1.4,flip:false,gy:1,armL:"hold",armR:"hold"});
    addEnt("cbook",{t:"book",x:470,y:808,s:.72,open:1,c:"#FF6F61"});
    addEnt("bro",broE({x:1720,y:815}));await walk("bro",1180,1500);
    set("bro",{pose:"floor",y:862,flip:false,gx:-1});await lc;
  }
};
/* 2 — نستمع إلى حكاية أبي */
function setup2(){
  clearEnts();useSet("living");$("#tint").classList.remove("on");
  ent("door",{t:"door",x:1468,y:648,open:0});ent("bagA",{t:"bag",x:1380,y:712,s:1});ent("bagB",{t:"bag",x:1440,y:735,s:.75});
  ent("dad",dadE({x:960,y:805}));ent("sbook",{t:"book",x:0,y:0,s:.75,open:1,c:"#8A63FF"});
  ent("mom",momE({x:640,y:805,gx:1}));ent("album",{t:"album",x:772,y:700,s:.55,open:1});
  ent("char",kid({x:470,y:862,s:1.4,pose:"floor",gy:1,armL:"hold",armR:"hold"}));ent("cbook",{t:"book",x:470,y:808,s:.72,open:1,c:"#FF6F61"});
  ent("bro",broE({x:1180,y:862,pose:"floor",gx:-1}));
  attach("sbook","dad","R",0,10);cam(800,470,1.05,0);
}
SC[2]={
  setup:setup2,
  async intro(){
    await line("s2a");
    set("dad",{mood:"smile",gx:.4});
    await armTo("dad","L",[770,330],700);set("dad",{handL:"open"});
    const flip=setInterval(()=>{if(!PAUSED&&R.ents.cbook&&R.ents.cbook.open)SFX.page()},1500);
    try{await line("s2b")}finally{clearInterval(flip)}
    await armTo("dad","L","lap",600);set("dad",{handL:null,gx:-1});
    await line("s2c");
    await cam(520,700,2.2,1200);
  },
  async interact(){
    hint(G("استعدّ لسماع حكاية الأب","استعدّي لسماع حكاية الأب"));panelHint(G("استعدّ لسماع حكاية الأب: المسِ الكتاب أوّلًا","استعدّي لسماع حكاية الأب: المسي الكتاب أوّلًا"));
    const b=R.ents.cbook;await waitTap(b.x,b.y+10,"الكتاب",52);
    set("cbook",{mark:true,open:0});SFX.page();
    await cam(720,560,1.45,1000);
    hint(G("والآن المسِ الأب","والآن المسي الأب"));
    const f=face("dad");await waitTap(f[0],f[1],"الأب",70);
  },
  async react(replay){
    hint(null);
    await Promise.all([line("s2d"),tw("char",{gy:-.5,gx:1,tilt:-4},600)]);set("char",{mood:"happy"});
    set("dad",{gx:0,mood:"happy"});await armTo("dad","L",[760,360],600);set("dad",{handL:"open"});
    await line("s2g");
    set("dad",{gx:-.6});await armTo("dad","L",[800,420],500);
    await line("s2h");
    set("dad",{gx:.4});set("bro",{mood:"wow"});await armTo("dad","L",[750,330],500);
    await line("s2i");
    set("dad",{gx:0});set("bro",{mood:"happy"});await armTo("dad","L",[760,360],400);
    await line("s2e");
    set("bro",{mood:"laugh"});anim("bro","a-jump",1300);await line("s2f");
    set("mom",{mood:"happy"});set("char",{mood:"laugh"});
    await armTo("dad","L","lap",500);set("dad",{handL:null});
    const f=face("dad");await cam(f[0],f[1]+40,2.4,1100);
    await Promise.all([line("m2"),emo("dad","joy",1)]);await wait(500);
    await cam(800,520,1.1,1000);
    if(!replay)await capture(2);
  },
  async shot(){await cam(760,560,1.35,900)},
  async link(){
    clearEmo();set("char",{gy:0,gx:1,tilt:0,mood:"happy"});set("bro",{mood:"happy"});
    detach("sbook");set("sbook",{x:1110,y:585,open:0});
    set("dad",{pose:"stand",y:808,s:1.5,armL:"down",armR:"down"});anim("dad","a-squash",400);
    const l2=line("l2a");await Promise.all([walk("dad",1330,2200),cam(1150,520,1.4,2200)]);
    await armTo("dad","R",[1382,712],700);attach("bagA","dad","R",0,0);set("dad",{handR:"fist"});
    await armTo("dad","R","down",600);
    SFX.creak();await tw("door",{open:1},900);
    await walk("dad",1560,1200);await tw("dad",{alpha:0},300);await l2;
    await line("l2b");
    await cam(1440,742,3.2,1500);
    await cut(setup3,380);
  }
};
/* 3 — نحملها معًا */
function setup3(){
  clearEnts();useSet("yard");$("#tint").classList.remove("on");
  ent("bin",{t:"bin",x:760,y:800,lid:0});ent("plane",{t:"plane",x:318,y:648,s:.5,rot:-6});
  ent("dad",{t:"actor",cfg:"dad",x:1060,y:810,s:1.5,pose:"stand",flip:true,armL:"down",armR:"down",handR:"fist",mood:"smile"});
  ent("bagA",{t:"bag",x:1060,y:700,s:1});
  ent("char",kid({x:1340,y:815,gx:1}));ent("bagB",{t:"bag",x:1440,y:735,s:.75});
  attach("bagA","dad","R");cam(1440,742,3.2,0);
}
SC[3]={
  setup:setup3,
  async intro(){
    await Promise.all([line("s3a"),cam(1150,520,1.45,1800)]);
    set("dad",{flip:false,gx:1});anim("dad","a-squash",400);
    await armTo("char","R",[1420,690],700);set("char",{handR:"open"});
  },
  async interact(){
    hint(G("اسحب الكيس إلى يد شخصيتك","اسحبي الكيس إلى يد شخصيتكِ"));
    await waitDrag({id:"bagB",label:"الكيس الصغير",gdy:62,gr:60,target:()=>handWorld(R.ents.char,"R"),tr:66,tlabel:G("يد شخصيتك","يد شخصيتكِ")});
    attach("bagB","char","R");set("char",{handR:"fist"});await swing("bagB");
    hint(null);
    await Promise.all([line("s3b"),walk("dad",640,3000),walk("char",930,3000),cam(790,520,1.5,3000)]);
    hint(G("ضع الكيس في الحاوية","ضعي الكيس في الحاوية"));
    await waitDrag({id:"bagB",label:"الكيس",gdy:62,gr:60,target:[760,540],tr:80,tlabel:"فتحة الحاوية",onGrab:()=>set("char",{handR:"open"}),onFail:()=>set("char",{handR:"fist"})});
    detach("bagB");await tw("bagB",{x:760,y:520},250,EO);await tw("bagB",{y:640,alpha:0},400,EI);SFX.thud();
    await armTo("char","R","down",400);set("char",{handR:null});
  },
  async react(replay){
    hint(null);
    set("dad",{flip:false,gx:1});
    await armTo("dad","R",[745,530],700);detach("bagA");set("dad",{handR:"open"});await tw("bagA",{y:640,alpha:0},400,EI);SFX.thud();
    await armTo("dad","R","down",500);set("dad",{handR:null,mood:"happy"});
    await line("s3c");fx("✦",700,420,5);
    const f=face("dad");await cam(f[0],f[1]+40,2.4,1100);
    const fh=partWorld(R.ents.dad,112,74);
    await Promise.all([line("m3"),emo("dad","calm"),(async()=>{await armTo("dad","R",fh,500);set("dad",{handR:"open"});await armTo("dad","R",[fh[0]+30,fh[1]+4],350);await armTo("dad","R","down",450);set("dad",{handR:null})})()]);await wait(400);
    await cam(790,520,1.5,1000);
    if(!replay)await capture(3);
  },
  async shot(){await cam(720,450,1.9,900)},
  async link(){
    clearEmo();SFX.thud();await Promise.all([line("l3a"),tw("bin",{lid:1},600)]);
    SFX.plane();await line("l3b");
    set("char",{flip:true,gx:1,mood:"wow"});
    await Promise.all([line("l3c"),cam(380,560,1.8,2600),walk("char",470,2600),tw("dad",{alpha:0},800)]);
    set("char",{mood:"happy"});
    await armTo("char","R",[322,652],800);set("char",{handR:"open"});
  }
};
/* 4 — جاء دور أخي */
function setup4(){
  clearEnts();useSet("yard");$("#tint").classList.remove("on");
  ent("bin",{t:"bin",x:760,y:800,lid:1});ent("trail",{t:"trail",pts:[],src:null});
  ent("char",kid({x:470,y:815,flip:true,armR:[322,652],handR:"open"}));
  ent("bro",broE({x:1000,y:815,alpha:0,flip:true}));ent("plane",{t:"plane",x:318,y:648,s:.5,rot:-6});ent("glow",{t:"glow",x:0,y:0,on:false});
  cam(380,560,1.8,0);
}
SC[4]={
  setup:setup4,
  async intro(){
    if(!R.ents.trail){addEnt("trail",{t:"trail",pts:[],src:null});addEnt("glow",{t:"glow",x:0,y:0,on:false});addEnt("bro",broE({x:1000,y:815,alpha:0,flip:true}))}
    toFront("plane");attach("plane","char","R",0,-6);set("char",{handR:"fist",flip:false});anim("char","a-squash",400);
    await armTo("char","R",[560,600],500);
    R.ents.trail.src="plane";SFX.whoosh();set("bro",{alpha:1});R.track=true;
    const broIn=walk("bro",720,2200);const s4=line("s4a");
    await cam(560,520,1.6,800);
    for(const p of[[600,470],[530,420],[470,500],[575,585]])await armTo("char","R",p,520);
    await broIn;await s4;R.ents.trail.src=null;R.track=false;
    set("bro",{gx:1,gy:.4,flip:true});
    await armTo("bro","R",[648,640],600);set("bro",{handR:"open"});
    await line("s4b");
    await cam(610,560,1.9,1000);
  },
  async interact(){
    hint(G("أعطِ الأخَ الطائرة. اسحبها إلى يده","أعطي الأخَ الطائرة. اسحبيها إلى يده"));
    await waitDrag({id:"plane",label:"الطائرة",gr:56,target:()=>handWorld(R.ents.bro,"R"),tr:60,tlabel:"كفّ الأخ",
      onGrab:()=>set("char",{handR:"open"}),onFail:()=>set("char",{handR:"fist"}),
      onNear:n=>{const h=handWorld(R.ents.bro,"R");set("glow",{on:n,x:h[0],y:h[1]})}});
  },
  async react(replay){
    hint(null);set("glow",{on:false});
    const h=handWorld(R.ents.bro,"R");detach("plane");await tw("plane",{x:h[0],y:h[1]-4,rot:-10},350,EO);
    attach("plane","bro","R",0,-4);set("bro",{handR:"fist",mood:"happy",gy:0});
    await armTo("char","R","down",400);set("char",{handR:null,mood:"happy"});
    await armTo("bro","R","up",600);
    await Promise.all([line("s4c"),walk("bro",860,900)]);fx("✦",860,430,6);
    const f=face("bro");await cam(f[0],f[1]+40,2.6,1000);
    anim("bro","a-jump",1300);set("bro",{mood:"laugh"});await Promise.all([line("m4"),emo("bro","joy")]);set("bro",{mood:"happy"});await wait(400);
    await cam(740,540,1.7,1000);
    if(!replay)await capture(4);
  },
  async shot(){await cam(820,480,2,900)},
  async link(){
    clearEmo();R.ents.trail.src="plane";set("char",{flip:false});
    await Promise.all([line("l4a"),walk("bro",1530,2600),walk("char",1150,2600),cam(1300,500,1.6,2600)]);
    R.ents.trail.src=null;await tw("bro",{alpha:0},300);
    await cut(()=>setup5(true),450);
    attach("plane","bro","R",0,-4);SFX.plane();
    const p1=walk("bro",-220,3400);
    await wait(1700);await cam(820,420,1.7,1500);
    await Promise.all([p1,walk("char",1240,2000)]);
    set("bro",{hidden:true});set("plane",{hidden:true});set("char",{flip:true});
  }
};
/* 5 — أعتني بأمّي */
function setup5(fromLink){
  clearEnts();useSet("room");$("#tint").classList.remove("on");
  ent("mirror",{t:"mirror",x:1100,y:350,rx:108,ry:150,refl:["mom","plane"],dep:["mom","plane","bro"]});
  ent("comb",{t:"comb",x:1180,y:566,rot:-8});ent("stool",{t:"stool",x:640,y:812});
  ent("char",kid(fromLink?{x:1720,y:815,flip:true}:{x:1240,y:815,flip:true}));
  ent("mom",momE({cfg:"momR",x:820,y:805,gx:1,strand:1,strandSide:"L"}));ent("cloth",{t:"cloth",x:812,y:612,s:.8});
  ent("bro",broE(fromLink?{x:1660,y:815,flip:true,armR:"up",handR:"fist"}:{x:-300,y:815,hidden:true}));
  ent("plane",{t:"plane",x:-300,y:600,s:.5,rot:-10,hidden:!fromLink});
  fromLink?cam(1100,360,2.1,0):cam(820,420,1.7,0);
}
SC[5]={
  setup:()=>setup5(false),
  async intro(){
    await line("s5a");
    await cam(1010,380,2,1100);await wait(600);
    await cam(950,480,1.55,1000);
    set("char",{gx:1,gy:.6});fx("✦",1180,556,4);await line("s5b");
    await Promise.all([walk("char",640,1700),cam(820,480,1.55,1700)]);set("char",{flip:false});
    await hopTo("char",640,660,600);set("char",{gy:0});
    await line("s5c");
    set("mom",{mood:"happy",tilt:6,gx:-1});anim("mom","a-nod",1400);await line("s5d");set("mom",{tilt:0});
  },
  async interact(){
    await armTo("char","R",[702,520],600);set("char",{handR:"open"});
    hint(G("خذ المشط وساعد الأمّ في ترتيب شعرها","خذي المشط وساعدي الأمّ في ترتيب شعرها"));
    await waitDrag({id:"comb",label:"المشط",gr:56,target:()=>handWorld(R.ents.char,"R"),tr:60,tlabel:G("يد شخصيتك","يد شخصيتكِ")});
    attach("comb","char","R");set("char",{handR:"fist"});set("comb",{rot:-70});
    await cam(760,420,2.1,900);set("mom",{gx:1});
    const mm=R.ents.mom;const pts=[[50,84],[42,118],[50,150],[44,184]].map(([lx,ly])=>{const w=partWorld(mm,lx,ly);return[w[0]-22,w[1]]});
    hint(G("مرّر إصبعك بجانب شعر الأمّ","مرّري إصبعكِ بجانب شعر الأمّ"));
    await waitTrace(pts,(p,w)=>{set("char",{armR:[w[0]-4,w[1]]});set("mom",{strand:clamp(1-p,0,1)})},"نقطة على شعر الأمّ");
    set("mom",{strand:0});
  },
  async react(replay){
    hint(null);
    const e5=line("s5e");set("mom",{gx:1,tilt:3});await cam(1050,380,2,1000);set("mom",{mood:"happy"});fx("✦",1100,330,5);await wait(900);
    detach("comb");await tw("comb",{x:1180,y:566,rot:-8},500,EO);
    await armTo("char","R",[737,540],600);set("char",{handR:null});
    await armTo("mom","L",[739,540],700);set("mom",{handL:"open",tilt:6,gx:-1,gy:-.4});
    await e5;await line("s5f");fx("♥",900,450,7);
    const f=face("mom");await cam(f[0]+20,f[1]+30,2.4,1000);
    await Promise.all([line("m5"),emo("mom","love",1)]);await wait(400);
    await cam(740,545,2.9,1000);
    if(!replay)await capture(5);
  },
  async shot(){await cam(790,440,1.9,900)},
  async link(){
    clearEmo();await Promise.all([line("l5a"),albumOverlay("six")]);
    await line("l5b");
    closeAlbum();
    $("#tint").classList.add("on");const l5=line("l5c");await wait(900);
    set("mom",{armL:"lap",handL:null,tilt:0,gy:0,gx:1,mood:"smile"});set("char",{armR:"down"});
    await hopTo("char",590,815,600);set("stool",{hidden:true});
    addEnt("album",{t:"album",x:0,y:0,s:.5,open:0});attach("album","char","R",-10,-14);
    set("char",{armL:"hold",armR:"hold"});
    await Promise.all([walk("char",520,2000),cam(680,480,1.5,2000)]);
    set("char",{flip:false,sh:5});await l5;
  }
};
/* 6 — والآن أمّي تسمعني */
function setup6(){
  clearEnts();useSet("room");$("#tint").classList.add("on");
  ent("mirror",{t:"mirror",x:1100,y:350,rx:108,ry:150,refl:["mom"],dep:["mom"]});
  ent("comb",{t:"comb",x:1180,y:566,rot:-8});ent("table",{t:"table",x:660,y:812,w:100});
  ent("mom",momE({cfg:"momR",x:820,y:805,gx:1,strand:0}));ent("cloth",{t:"cloth",x:812,y:612,s:.8});
  ent("char",kid({x:520,y:815,armL:"hold",armR:"hold",sh:5}));ent("album",{t:"album",x:0,y:0,s:.5,open:0});
  attach("album","char","R",-10,-14);cam(680,480,1.5,0);
}
SC[6]={
  setup:setup6,
  async intro(){
    if(!R.ents.table){ent("table",{t:"table",x:660,y:812,w:100});R.order.splice(R.order.indexOf("mom"),0,R.order.pop());drawMid()}
    await line("s6a");
    attach("cloth","mom","R");await armTo("mom","R",[968,560],700);detach("cloth");set("cloth",{x:992,y:566});await armTo("mom","R","lap",500);
    set("mom",{flip:true,gx:1,mood:"smile"});anim("mom","a-squash",400);await line("s6b");
    detach("album");await tw("album",{x:660,y:700},500,EO);set("char",{armL:"down",armR:"down"});
  },
  async interact(){
    await cam(660,640,1.7,900);
    hint(G("افتح الألبوم واختر لحظة أحببتها","افتحي الألبوم واختاري لحظة أحببتِها"));
    await waitTap(660,700,"الألبوم",58);set("album",{open:1});SFX.page();
    hint(G("اسحب الصورة المفضّلة إلى الصفحة أمام الأمّ","اسحبي الصورة المفضّلة إلى الصفحة أمام الأمّ"));
    CHOSEN=await waitPick();
  },
  async react(replay){
    hint(null);
    await Promise.all([line("s6c"),showBig(CHOSEN)]);set("album",{photo:CHOSEN});
    set("mom",{gy:1,gx:.3});const d6=line("s6d");await wait(900);
    set("mom",{pose:"kneel",s:1.48});anim("mom","a-squash",400);await tw("mom",{x:770,lean:8},700);
    set("mom",{gy:0,gx:1,mood:"smile"});
    await d6;await line("s6e");
    await Promise.all([tw("char",{sh:0},900),armTo("char","L","down",600),armTo("char","R","down",600)]);
    set("char",{mood:"happy"});
    await cam(645,470,2.0,1100);
    set("char",{talk:true});await line("s6f");set("char",{talk:false});
    await Promise.all([line("m6"),emo("char","calm")]);
  },
  async shot(){await cam(645,470,2.0,600)}
};

/* ---------------- runner ---------------- */
async function sceneBody(n){
  CUR={mode:"scene",n};storyPanel();setPg(n+1);
  await titleCard(n,TITLES[n]);
  await SC[n].intro();await SC[n].interact();
  R.snap=snap();await SC[n].react(false);await SC[n].shot();
  askScene(n);
}
async function runFrom(n,withLink){
  abortAll();closeOv();UIL.querySelectorAll(".albumov,.bigphoto,.subt,.startbtn,.pgclone").forEach(x=>x.remove());
  CUR={mode:"scene",n};storyPanel();
  try{if(withLink)await SC[n-1].link();else SC[n].setup();drawMid();await sceneBody(n)}catch(e){if(e!==ABORT)report(e)}
}
async function replay(){
  if(CUR.mode==="ask"&&R.snap){abortAll();restore(R.snap);try{await SC[CUR.n].react(true);await SC[CUR.n].shot()}catch(e){if(e!==ABORT)report(e)}}
  else if(CUR.mode==="scene"&&CUR.n>=1)runFrom(CUR.n,false);
  else if(CUR.mode==="creator")cam(700,450,1.3,600).catch(()=>{});
}
async function runEnding(){
  abortAll();closeOv();CUR={mode:"end",n:6};setPg(8);
  try{
    endPanel(false);clearEmo();
    set("char",{mood:"happy"});if(R.ents.mom)set("mom",{mood:"happy"});
    await Promise.all([line("e01"),cam(800,450,1,3000)]);
    await capture(6);
    const e2=line("e02");await albumOverlay("end");await e2;
    endPanel(true);
  }catch(e){if(e!==ABORT)report(e)}
}

/* ---------------- album overlays, photo pick, viewer ---------------- */
function slotHTML(k,click){const ph=PHOTOS[k];return `<${click?"button":"div"} class="slot ${ph?"has":""}" data-k="${k}" ${click&&ph?`aria-label="أعد مشاهدة اللحظة ${ar(k)}"`:""}>${ph?ph.svg:ar(k)}</${click?"button":"div"}>`}
function spreadHTML(click){return `<div class="spread"><div class="page">${[1,2,3,4].map(k=>slotHTML(k,click)).join("")}</div><div class="page">${slotHTML(5,click)}${slotHTML(6,click)}<div class="slot" style="border:0;background:none;grid-column:1/-1"><svg viewBox="-110 -110 220 220" style="width:60%;height:100%">${flowerG(1,[1,2,3,4,5,6].map(k=>ST[k].ev==="correct"))}</svg></div></div></div>`}
function closeAlbum(){UIL.querySelectorAll(".albumov").forEach(n=>n.remove())}
async function albumOverlay(kind){
  closeAlbum();const ov=document.createElement("div");ov.className="albumov";UIL.appendChild(ov);
  if(kind==="six"){ov.innerHTML=spreadHTML(false);SFX.page();await wait(500);
    const s6=ov.querySelector('.slot[data-k="6"]');const r=s6.getBoundingClientRect(),sr=stage.getBoundingClientRect();
    const h=document.createElement("div");h.className="hand";h.innerHTML=HANDSVG;h.style.left=(r.left-sr.left+r.width/2)+"px";h.style.top=(r.top-sr.top+r.height/2)+"px";ov.appendChild(h);
    s6.style.borderColor="#FFB04A";await wait(1300);return}
  const name=NAME();
  ov.innerHTML=`<div class="spread" style="grid-template-columns:1fr;background:#E8467C"><div class="covertxt" style="color:#fff"><svg viewBox="-110 -110 220 220" style="width:22%">${flowerG(1,[1,2,3,4,5,6].map(k=>ST[k].ev==="correct"))}</svg><h2>هذه حكايتي مع أُسرتي</h2>${name?`<p style="font-family:var(--f-display);font-size:clamp(1.2rem,2.6vw,2.6rem);font-weight:800">${esc(name)}</p>`:""}</div></div>`;
  SFX.magic();await wait(2600);
  ov.innerHTML=spreadHTML(true);SFX.page();
  ov.addEventListener("click",e=>{const s=e.target.closest(".slot.has");if(s)viewer(+s.dataset.k)});
}
function waitPick(){
  const my=RUN;
  return new Promise(res=>{
    const keys=[1,2,3,4,5].filter(k=>PHOTOS[k]);if(!keys.length){PHOTOS.tmp=photoSVG();keys.push("tmp")}
    const tray=document.createElement("div");tray.className="tray";
    tray.innerHTML=keys.map(k=>`<button class="card" data-k="${k}" aria-label="${k==="tmp"?"صورة":"صورة الإطار "+ar(k)}">${PHOTOS[k].svg}</button>`).join("");UIL.appendChild(tray);
    const tgt=document.createElement("button");tgt.className="pagetgt";tgt.setAttribute("aria-label","الصفحة أمام الأمّ");
    place(tgt,660,694,0);const sz=()=>{const p=w2s(0,0);tgt.style.width=(150*p.k)+"px";tgt.style.height=(98*p.k)+"px"};sz();
    let sel=null,drag=null;
    const over=(x,y)=>{const r=tgt.getBoundingClientRect();return x>r.left-30&&x<r.right+30&&y>r.top-30&&y<r.bottom+30};
    const done=k=>{tray.remove();tgt.remove();SFX.good();res(k==="tmp"?"tmp":+k)};
    tray.addEventListener("pointerdown",ev=>{const c=ev.target.closest(".card");if(!c)return;ev.preventDefault();try{c.setPointerCapture(ev.pointerId)}catch(_){}drag={c,x:ev.clientX,y:ev.clientY,moved:false,g:null}});
    tray.addEventListener("pointermove",ev=>{if(!drag)return;
      if(!drag.moved&&Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)>10){drag.moved=true;const r=drag.c.getBoundingClientRect();const g=drag.c.cloneNode(true);g.classList.add("drag");g.style.width=r.width+"px";g.style.height=r.height+"px";document.body.appendChild(g);drag.g=g;drag.w=r.width;drag.h=r.height}
      if(drag.moved){drag.g.style.left=(ev.clientX-drag.w/2)+"px";drag.g.style.top=(ev.clientY-drag.h/2)+"px";tgt.classList.toggle("armed",over(ev.clientX,ev.clientY))}});
    const up=ev=>{if(!drag)return;const d=drag;drag=null;
      if(!d.moved){tray.querySelectorAll(".card").forEach(c=>c.classList.toggle("sel",c===d.c&&sel!==d.c));sel=sel===d.c?null:d.c;tgt.classList.toggle("armed",!!sel);SFX.tap();return}
      d.g.remove();tgt.classList.remove("armed");if(over(ev.clientX,ev.clientY))done(d.c.dataset.k);else SFX.soft()};
    tray.addEventListener("pointerup",up);tray.addEventListener("pointercancel",up);
    tgt.addEventListener("click",()=>{if(sel)done(sel.dataset.k)});
  }).then(chk(my));
}
async function showBig(k){const ph=PHOTOS[k];if(!ph)return;const d=document.createElement("div");d.className="bigphoto";d.innerHTML=ph.svg;UIL.appendChild(d);SFX.pop();await wait(1700);d.remove()}
function viewer(k){
  const ph=PHOTOS[k];if(!ph)return;
  $("#ovbox").className="";$("#ovbox").innerHTML=`<div class="viewer"><div class="ph">${ph.svg}</div><div class="vbar"><b>${k===6?"اللحظة السادسة":"اللحظة "+ar(k)}${TITLES[k]?" — "+TITLES[k]:""}</b><button class="btn sm turq" id="vClose">إغلاق</button></div></div>`;
  $("#ov").hidden=false;SFX.pop();
  setTimeout(()=>$$("#ovbox .actor").forEach(a=>a.classList.add("a-jump")),300);
  $("#vClose").onclick=closeOv;$("#vClose").focus();
}
function closeOv(){$("#ov").hidden=true;$("#ovbox").innerHTML=""}
$("#ov").addEventListener("click",e=>{if(e.target.id==="ov")closeOv()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#ov").hidden)closeOv()});

/* ---------------- expression, help, teacher evaluation ---------------- */
function askScene(n){
  CUR={mode:"ask",n};hint(null);
  const qa=QS[n]();panelEl.style.setProperty("--c","#8A63FF");
  panelEl.innerHTML=`<div class="cap"><div class="who">${portrait("narrator")}</div><div><span class="chip">${G("سؤالك","سؤالكِ")} — المشهد ${ar(n)}</span><p class="line q enter">${qa.q}</p></div></div><div id="askArea" style="display:flex;flex-direction:column;gap:10px"></div>`;
  vline("q"+n);renderAsk();
}
function renderAsk(){
  const n=CUR.n,qa=QS[n](),st=ST[n],A=$("#askArea");if(!A)return;let h="";
  if(st.phase==="express"){
    if(st.ev==="wrong")h+=`<div class="retry enter" role="status">🔍 ${UI.retry()}</div>`;
    h+=`<div class="modes"><button class="mode w ${st.mode==="write"?"on":""}" data-a="write"><span class="mi">${ICN.write}</span>أكتب إجابتي</button><button class="mode o ${st.mode==="oral"?"on":""}" data-a="oral"><span class="mi">${ICN.oral}</span>أجيب شفهيًّا</button></div>`;
    if(st.mode==="write")h+=`<textarea id="ta" placeholder="أكتبُ فكرتي هنا" aria-label="أكتب فكرتي هنا">${esc(st.text)}</textarea>`;
    else if(st.mode==="oral")h+=`<div class="oral enter"><p>🎤 ${UI.oral()}</p></div>`;
    else h+=`<p style="text-align:center;color:var(--ink2);font-weight:600">${G("اختر طريقة التعبير عن فكرتك","اختاري طريقة التعبير عن فكرتكِ")}</p>`;
    h+=`<div class="row sb"><button class="helpbtn" data-a="help" aria-expanded="${st.helpOpen}"><span class="hi">${ICN.help}</span>${st.helpOpen?"إخفاء المساعدة":"أحتاج إلى مساعدة"}</button>${st.mode?`<button class="btn turq" id="doneB" data-a="done" ${st.mode==="write"&&!st.text.trim()?"disabled":""}>انتهيت</button>`:""}</div>`;
    if(st.helpOpen)h+=`<div class="help enter"><h3>${UI.helpQ()}</h3><div class="hopts">${qa.h.map((x,i)=>`<button class="hopt ${st.picked===i?"picked":""}" data-a="pick" data-k="${i}"><span class="hn">${ar(i+1)}</span>${x.t}</button>`).join("")}</div>${st.picked!==null?`<p class="nowmsg">${UI.now()}</p>`:""}</div>`;
    h+=`<div class="row"><button class="linkbtn" data-a="replay">↺ إعادة لقطة النتيجة</button></div>`;
  }else{
    h+=st.mode==="write"?`<div class="answer"><small>✏️ الإجابة المكتوبة</small><p>${esc(st.text)}</p></div>`:`<div class="answer"><small>🎤 إجابة شفهية</small><p>${G("تحدّث التلميذ إلى المعلّم.","تحدّثت التلميذة إلى المعلّم.")}</p></div>`;
    if(st.phase==="evaluate")h+=`<div class="teacher enter"><h3>👩‍🏫 تقييم المعلّم</h3><p>قيّم معنى الإجابة، واقبل اختلاف الصياغة ما دامت توضّح أثر الفعل على فرد الأسرة.</p><div class="tb"><button class="btn turq" data-a="ok">صحيح ✓</button><button class="btn coral" data-a="no">خطأ</button></div></div>`;
    else h+=`<div class="good enter" role="status">🌸 ${UI.good()}</div>
      <div class="row sb"><span class="row"><button class="linkbtn" data-a="edit">تعديل التعبير</button><button class="linkbtn" data-a="reeval">تغيير التقييم</button><button class="linkbtn" data-a="replay">↺ إعادة اللقطة</button></span>
      <button class="btn grape" data-a="next">👩‍🏫 ${n<6?"نتابع الحكاية":"نختم الألبوم"} ◂</button></div>`;
    if(st.phase==="evaluate")h+=`<div class="row"><button class="linkbtn" data-a="edit">تعديل التعبير</button><button class="linkbtn" data-a="replay">↺ إعادة اللقطة</button></div>`;
  }
  A.innerHTML=h;
  const ta=$("#ta");if(ta)ta.addEventListener("input",()=>{st.text=ta.value;const d=$("#doneB");if(d)d.disabled=!ta.value.trim()});
}
function focusTA(){const ta=$("#ta");if(ta){ta.focus({preventScroll:true});ta.setSelectionRange(ta.value.length,ta.value.length)}}
panelEl.addEventListener("click",e=>{
  if(CUR.mode!=="ask")return;const b=e.target.closest("[data-a]");if(!b)return;
  const n=CUR.n,st=ST[n],qa=QS[n](),a=b.dataset.a;SFX.tap();
  if(a==="write"){st.mode="write";renderAsk();focusTA()}
  else if(a==="oral"){st.mode="oral";renderAsk();vline("u_oral")}
  else if(a==="help"){st.helpOpen=!st.helpOpen;renderAsk();if(st.helpOpen){stopVoice();[...HORD[n]].reduce((p,k)=>p.then(()=>vline("h"+n+k)),vline("u_helpq"))}else stopVoice()}
  else if(a==="pick"){st.picked=+b.dataset.k;renderAsk();stopVoice();vline("u_now");if(st.mode==="write")focusTA()}
  else if(a==="done"){if(st.mode==="write"&&!st.text.trim())return;st.phase="evaluate";st.helpOpen=false;stopVoice();renderAsk()}
  else if(a==="ok"){st.ev="correct";st.phase="done";SFX.good();renderAsk();renderStrip();fx("🌸",CAM.cx,CAM.cy-120/CAM.z,6);vline("u_good");
    Object.keys(R.ents).forEach(k=>{const en=R.ents[k];if(en.t==="actor"&&!en.hidden&&en.alpha!==0){if(en.mood!=="love")en.mood="happy";DIRTY.add(k);anim(k,"a-jump",1300)}})}
  else if(a==="no"){st.ev="wrong";st.phase="express";st.picked=null;SFX.soft();renderAsk();renderStrip();vline("u_retry");if(st.mode==="write")focusTA()}
  else if(a==="edit"){st.phase="express";renderAsk();if(st.mode==="write")focusTA()}
  else if(a==="reeval"){st.phase="evaluate";renderAsk()}
  else if(a==="replay"){replay()}
  else if(a==="next"){n<6?runFrom(n+1,true):runEnding()}
});

/* ---------------- end, results, teacher menu ---------------- */
function endPanel(ready){
  panelEl.style.setProperty("--c","#FF6F61");
  panelEl.innerHTML=`<div class="coverp enter"><h1>${ready?"اكتمل الألبوم!":"نختم الألبوم…"}</h1><p>${ready?G("المسْ أيّ صورة لتشاهد لحظتها من جديد.","المسي أيّ صورة لتشاهدي لحظتها من جديد."):"تُلتقط اللحظة السادسة الآن."}</p></div>
    ${ready?`<div class="row"><button class="btn grape" id="eRes">👩‍🏫 النتيجة</button><button class="btn ghost" id="eAgain">↺ الحكاية من جديد</button><button class="btn coral" id="eNew">تلميذ جديد</button></div><button class="xbtn" id="eX"><span class="hi">✨</span>${ENR.done?G("أجبتَ عن السؤال الإثرائي ✓","أجبتِ عن السؤال الإثرائي ✓"):"سؤال إثرائي (اختياري)"}</button>${CREDITS}`:""}`;
  if(ready){$("#eX").onclick=enrichQ;$("#eRes").onclick=showResult;$("#eAgain").onclick=()=>runFrom(1,false);let armed=false;$("#eNew").onclick=e=>{if(!armed){armed=true;e.currentTarget.textContent="اضغط مرّة أخرى للمسح";return}newStudent()}}
}
let ENR={mode:null,text:"",done:false};
function enrichQ(){SFX.tap();$("#ovbox").className="ovbox";renderEnrich();$("#ov").hidden=false;stopVoice();vline("x1")}
function renderEnrich(){const b=$("#ovbox"),q=lineInfo("x1").text;
  b.innerHTML=`<span class="tag">✨ سؤال إثرائي — اختياري، لا يدخل في الدرجة</span><h2 class="xq">${q}</h2>
    ${ENR.done?`<div class="good enter" role="status">🌸 ${UI.good()}</div>${ENR.mode==="write"?`<div class="answer"><small>✏️ الإجابة المكتوبة</small><p>${esc(ENR.text)}</p></div>`:""}<div class="row"><button class="btn turq" data-x="close">إغلاق</button></div>`
    :`<div class="modes"><button class="mode w ${ENR.mode==="write"?"on":""}" data-x="write"><span class="mi">${ICN.write}</span>أكتب إجابتي</button><button class="mode o ${ENR.mode==="oral"?"on":""}" data-x="oral"><span class="mi">${ICN.oral}</span>أجيب شفهيًّا</button></div>
    ${ENR.mode==="write"?`<textarea id="xta" placeholder="أكتبُ فكرتي هنا" aria-label="أكتب فكرتي هنا">${esc(ENR.text)}</textarea>`:ENR.mode==="oral"?`<div class="oral enter"><p>🎤 ${UI.oral()}</p></div>`:""}
    <div class="row sb"><button class="btn ghost" data-x="close">لاحقًا</button>${ENR.mode?`<button class="btn turq" data-x="done" ${ENR.mode==="write"&&!ENR.text.trim()?"disabled":""}>انتهيت</button>`:""}</div>`}`;
  b.onclick=e=>{const t=e.target.closest("[data-x]");if(!t)return;const a=t.dataset.x;SFX.tap();
    if(a==="close"){closeOv();if(CUR.mode==="end")endPanel(true);return}
    if(a==="write"||a==="oral"){ENR.mode=a;renderEnrich();if(a==="oral")vline("u_oral");else{const ta=$("#xta");if(ta)ta.focus()}}
    if(a==="done"){if(ENR.mode==="write"&&!ENR.text.trim())return;ENR.done=true;SFX.good();renderEnrich();vline("u_good")}};
  const ta=$("#xta");if(ta)ta.oninput=()=>{ENR.text=ta.value;const d=b.querySelector('[data-x="done"]');if(d)d.disabled=!ta.value.trim()};
}
function showResult(){
  const n=[1,2,3,4,5,6].filter(k=>ST[k].ev==="correct").length;
  $("#ovbox").className="ovbox";
  $("#ovbox").innerHTML=`<span class="tag">👩‍🏫 للمعلّم</span><h2>نتيجة الألبوم${NAME()?" — "+esc(NAME()):""}</h2>
    <p class="score">${G("عبّر التلميذ","عبّرت التلميذة")} عن أثر التقدير تعبيرًا صحيحًا في <b>${ar(n)}</b> من ${ar(6)} مواقف</p>
    <div class="goal ${n>=5?"y":"n"}">${n>=5?"✓ تحقّق الهدف: خمسة مواقف أو أكثر من ستة.":`لم يتحقّق الهدف بعد: المطلوب خمسة مواقف، وتحقّق ${ar(n)}.`}</div>
    <ul class="rlist">${[1,2,3,4,5,6].map(k=>{const ev=ST[k].ev,md=ST[k].mode;return `<li><span>${ar(k)}. ${TITLES[k]}${md?` <small style="color:var(--ink2)">(${md==="write"?"كتابيًّا":"شفهيًّا"})</small>`:""}</span><span class="st ${ev==="correct"?"ok":ev==="wrong"?"no":"na"}">${ev==="correct"?"صحيح":ev==="wrong"?"خطأ":"لم يُقيَّم"}</span></li>`}).join("")}</ul>
    ${ENR.done?`<p class="xres"><b>✨ السؤال الإثرائي (لا يدخل في الدرجة):</b> ${ENR.mode==="write"?esc(ENR.text):"أجاب شفهيًّا"}</p>`:""}
    <p style="color:var(--ink2);font-size:.95rem">يُحتسب آخر تقييم سجّلته لكلّ مشهد مرّة واحدة. السحب واستخدام المساعدة لا يدخلان في الدرجة.</p>
    <div class="row"><button class="btn ghost" id="rClose">إغلاق</button></div>${CREDITS}`;
  $("#ov").hidden=false;$("#rClose").onclick=closeOv;$("#rClose").focus();
}
function newStudent(){ST=fresh();ENR={mode:null,text:"",done:false};for(const k in PHOTOS)delete PHOTOS[k];CHOSEN=null;CHAR=defaultChar("boy");CTAB="me";showCover()}
function teacherMenu(){
  $("#ovbox").className="ovbox";
  $("#ovbox").innerHTML=`<span class="tag">👩‍🏫 قائمة المعلّم</span><h2>الانتقال في الحكاية</h2>
    <div class="mgrid"><button class="btn ghost" data-j="0">الغلاف</button><button class="btn ghost" data-j="c">تصميم الشخصية</button>${[1,2,3,4,5,6].map(k=>`<button class="btn ghost" data-j="${k}">${ar(k)}. ${TITLES[k]}</button>`).join("")}<button class="btn ghost" data-j="end">ختام الألبوم</button></div>
    <div class="row"><button class="btn grape" data-j="res">النتيجة</button><button class="btn coral" data-j="new">تلميذ جديد</button><button class="btn ghost" data-j="x">إغلاق</button></div>
    <p class="teachnote" style="margin-top:10px">يحتفظ القفز بين المشاهد بمظهر الشخصية وبالإجابات والتقييمات المسجّلة.</p>`;
  $("#ov").hidden=false;let armed=false;
  $("#ovbox").onclick=e=>{const b=e.target.closest("[data-j]");if(!b)return;const j=b.dataset.j;
    if(j==="x"){closeOv();return}if(j==="res"){showResult();return}
    if(j==="new"){if(!armed){armed=true;b.textContent="اضغط مرّة أخرى للمسح";return}closeOv();newStudent();return}
    closeOv();if(PAUSED)setPause(false);UIL.querySelectorAll(".startbtn").forEach(n=>n.remove());
    if(j==="0")showCover();else if(j==="c")startStory();else if(j==="end"){abortAll();setup6();drawMid();runEnding()}else runFrom(+j,false)};
}

/* ---------------- boot ---------------- */
renderStrip();showCover();
window.__album={runFrom,ST,PHOTOS,CHAR:()=>CHAR,CUR:()=>CUR,R,cap:n=>capture(n)};
