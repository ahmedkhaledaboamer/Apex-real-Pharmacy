export interface LocalizedString {
  en: string;
  ar: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString[]; // array of paragraphs
  category: 'Medicines' | 'Nutrition' | 'Skincare' | 'Wellness';
  image: string;
  date: string; // ISO
  readMinutes: number;
  author: {name: LocalizedString;role: LocalizedString;};
  featured?: boolean;
}

export const blogCategories = [
'All',
'Medicines',
'Nutrition',
'Skincare',
'Wellness'] as
const;
export type BlogCategory = (typeof blogCategories)[number];

export const blogPosts: BlogPost[] = [
{
  id: 'post-1',
  slug: 'using-pain-relievers-safely',
  title: {
    en: 'How to Use Over-the-Counter Pain Relievers Safely',
    ar: 'كيف تستخدم المسكنات دون وصفة طبية بأمان'
  },
  excerpt: {
    en: 'Paracetamol and ibuprofen are in almost every home. Here is what you need to know about doses, timing, and when to choose one over the other.',
    ar: 'الباراسيتامول والإيبوبروفين موجودان في كل بيت تقريباً. إليك ما تحتاج معرفته عن الجرعات والتوقيت ومتى تختار أحدهما دون الآخر.'
  },
  content: [
  {
    en: 'Over-the-counter pain relievers are safe and effective when used correctly — but "available without a prescription" does not mean "free of risk". Most problems come from taking too much, taking two products that contain the same active ingredient, or using them for too long.',
    ar: 'المسكنات التي تُصرف دون وصفة طبية آمنة وفعالة عند استخدامها بالشكل الصحيح، لكن "متاحة دون وصفة" لا تعني "خالية من المخاطر". معظم المشكلات تنتج عن تناول جرعة زائدة، أو الجمع بين منتجين يحتويان على المادة الفعالة نفسها، أو الاستمرار في استخدامها لفترة طويلة.'
  },
  {
    en: 'Paracetamol is gentle on the stomach and suits most people, including during pregnancy when advised by a doctor. Adults should not exceed 4 g a day, and less if you drink alcohol regularly or have liver disease. Always check cold and flu products: many already contain paracetamol.',
    ar: 'الباراسيتامول لطيف على المعدة ويناسب معظم الناس، بما في ذلك أثناء الحمل عند استشارة الطبيب. يجب ألا يتجاوز البالغون 4 غرامات يومياً، وأقل من ذلك لمن يتناول الكحول بانتظام أو يعاني من أمراض الكبد. وتحقق دائماً من أدوية البرد والإنفلونزا، فكثير منها يحتوي على الباراسيتامول أصلاً.'
  },
  {
    en: 'Ibuprofen also reduces inflammation, which makes it useful for muscle pain, toothache, and period pain. Take it with food, and avoid it if you have stomach ulcers, kidney problems, or are in the last trimester of pregnancy.',
    ar: 'أما الإيبوبروفين فيخفف الالتهاب أيضاً، ما يجعله مفيداً لآلام العضلات والأسنان والدورة الشهرية. تناوله مع الطعام، وتجنّبه إذا كنت تعاني من قرحة المعدة أو مشكلات في الكلى أو كنتِ في الثلث الأخير من الحمل.'
  },
  {
    en: 'If pain lasts more than a few days, keeps coming back, or comes with a high fever, see a doctor. Our pharmacists are always happy to check your medicines and help you choose the right option.',
    ar: 'إذا استمر الألم أكثر من بضعة أيام أو تكرر أو صاحبته حرارة مرتفعة، فراجع الطبيب. ويسعد صيادلتنا دائماً بمراجعة أدويتك ومساعدتك في اختيار الخيار المناسب.'
  }],

  category: 'Medicines',
  image: '/images/site/blog-pain.webp',
  date: '2026-04-12',
  readMinutes: 5,
  author: {
    name: { en: 'Dr. Sara Al Mansoori', ar: 'د. سارة المنصوري' },
    role: { en: 'Chief Pharmacist', ar: 'رئيسة الصيادلة' }
  },
  featured: true
},
{
  id: 'post-2',
  slug: 'understanding-spf',
  title: {
    en: 'Understanding SPF: How to Choose the Right Sunscreen',
    ar: 'فهم معامل الحماية: كيف تختار واقي الشمس المناسب'
  },
  excerpt: {
    en: 'SPF, UVA, broad spectrum — the labels can be confusing. A pharmacist explains what really matters under the UAE sun.',
    ar: 'معامل الحماية، والأشعة فوق البنفسجية أ، والطيف الواسع — قد تكون الملصقات محيّرة. صيدلانية تشرح ما يهم حقاً تحت شمس الإمارات.'
  },
  content: [
  {
    en: 'SPF measures protection against UVB rays, the main cause of sunburn. SPF 30 blocks about 97% of UVB and SPF 50 about 98%. In a climate as sunny as the UAE, SPF 50 is a sensible everyday choice.',
    ar: 'يقيس معامل الحماية SPF مدى الوقاية من أشعة UVB، وهي السبب الرئيسي لحروق الشمس. يحجب SPF 30 نحو 97% من هذه الأشعة، ويحجب SPF 50 نحو 98%. وفي مناخ مشمس كمناخ الإمارات، يُعد SPF 50 خياراً مناسباً للاستخدام اليومي.'
  },
  {
    en: 'Look for "broad spectrum" on the label: it means the product also protects against UVA rays, which cause premature ageing and pigmentation and pass through windows and clouds.',
    ar: 'ابحث عن عبارة "واسع الطيف" على العبوة، فهي تعني أن المنتج يحمي أيضاً من أشعة UVA التي تسبب الشيخوخة المبكرة والتصبغات وتخترق النوافذ والغيوم.'
  },
  {
    en: 'Apply generously — about a teaspoon for the face and neck — 15 minutes before going out, and reapply every two hours or after swimming. Babies under six months should be kept out of direct sun rather than covered in sunscreen.',
    ar: 'ضع كمية كافية — نحو ملعقة صغيرة للوجه والرقبة — قبل الخروج بخمس عشرة دقيقة، وأعد وضعه كل ساعتين أو بعد السباحة. أما الرضع دون ستة أشهر فيجب إبعادهم عن الشمس المباشرة بدلاً من وضع واقي الشمس لهم.'
  }],

  category: 'Skincare',
  image: '/images/site/blog-spf.webp',
  date: '2026-03-28',
  readMinutes: 6,
  author: {
    name: { en: 'Dr. Mariam Youssef', ar: 'د. مريم يوسف' },
    role: { en: 'Pharmacist, Skin Care', ar: 'صيدلانية متخصصة في العناية بالبشرة' }
  },
  featured: true
},
{
  id: 'post-3',
  slug: 'vitamin-d-in-a-sunny-country',
  title: {
    en: 'Why Vitamin D Deficiency Is Common — Even in a Sunny Country',
    ar: 'لماذا يشيع نقص فيتامين د حتى في بلد مشمس؟'
  },
  excerpt: {
    en: 'Plenty of sunshine does not guarantee enough vitamin D. Learn the signs of deficiency and how supplements can help.',
    ar: 'وفرة الشمس لا تضمن ما يكفي من فيتامين د. تعرّف على علامات النقص وكيف يمكن للمكملات أن تساعد.'
  },
  content: [
  {
    en: 'Studies show that a large share of people in the Gulf region have low vitamin D levels. Long hours indoors, covering clothing, and avoiding the midday heat all reduce how much vitamin D the skin can make.',
    ar: 'تُظهر الدراسات أن نسبة كبيرة من سكان منطقة الخليج لديهم مستويات منخفضة من فيتامين د. فقضاء ساعات طويلة في الأماكن المغلقة، وارتداء الملابس الساترة، وتجنّب حرارة الظهيرة، كلها عوامل تقلل ما يستطيع الجلد إنتاجه من هذا الفيتامين.'
  },
  {
    en: 'Tiredness, muscle aches, low mood, and frequent infections can all be signs of deficiency. A simple blood test confirms it, and your doctor can recommend the right dose.',
    ar: 'قد يكون التعب وآلام العضلات وتقلّب المزاج وتكرار العدوى من علامات النقص. ويؤكد ذلك فحص دم بسيط، ويمكن لطبيبك أن يحدد الجرعة المناسبة.'
  },
  {
    en: 'For maintenance, many adults take 1,000–2,000 IU of vitamin D3 daily with a meal that contains some fat. Ask our pharmacists before combining it with other supplements, especially calcium or multivitamins.',
    ar: 'وللحفاظ على المستوى الطبيعي، يتناول كثير من البالغين 1000 إلى 2000 وحدة دولية من فيتامين د3 يومياً مع وجبة تحتوي على بعض الدهون. استشر صيادلتنا قبل الجمع بينه وبين مكملات أخرى، خاصة الكالسيوم أو الفيتامينات المتعددة.'
  }],

  category: 'Nutrition',
  image: '/images/site/blog-vitamin-d.webp',
  date: '2026-03-15',
  readMinutes: 4,
  author: {
    name: { en: 'Ahmed Saleh', ar: 'أحمد صالح' },
    role: { en: 'Clinical Nutrition Pharmacist', ar: 'صيدلي التغذية العلاجية' }
  },
  featured: true
},
{
  id: 'post-4',
  slug: 'cold-or-flu',
  title: {
    en: 'Cold or Flu? How to Tell the Difference and Recover Faster',
    ar: 'برد أم إنفلونزا؟ كيف تفرّق بينهما وتتعافى أسرع'
  },
  excerpt: {
    en: 'They share many symptoms, but they are not the same illness. Here is how to manage each one at home and when to seek help.',
    ar: 'يتشاركان في كثير من الأعراض لكنهما ليسا المرض نفسه. إليك كيف تتعامل مع كل منهما في المنزل ومتى تطلب المساعدة.'
  },
  content: [
  {
    en: 'A cold usually starts slowly with a sore throat, runny nose, and sneezing. Flu tends to hit suddenly with a high fever, body aches, and exhaustion that can keep you in bed for days.',
    ar: 'يبدأ البرد عادة تدريجياً بالتهاب الحلق وسيلان الأنف والعطس، بينما تهاجم الإنفلونزا فجأة بحرارة مرتفعة وآلام في الجسم وإرهاق قد يُبقيك في الفراش عدة أيام.'
  },
  {
    en: 'For both, rest and fluids come first. Paracetamol or ibuprofen ease fever and aches, saline sprays clear a blocked nose, and lozenges soothe the throat. Antibiotics do not work against these viruses.',
    ar: 'في الحالتين، تأتي الراحة والسوائل أولاً. يخفف الباراسيتامول أو الإيبوبروفين الحرارة والآلام، وتساعد بخاخات المحلول الملحي على فتح الأنف المسدود، وتلطّف أقراص الاستحلاب الحلق. ولا تفيد المضادات الحيوية ضد هذه الفيروسات.'
  },
  {
    en: 'See a doctor if you have difficulty breathing, chest pain, a fever lasting more than three days, or if you are elderly, pregnant, or have a chronic condition. The annual flu vaccine remains the best protection.',
    ar: 'راجع الطبيب إذا عانيت من صعوبة في التنفس أو ألم في الصدر أو حرارة تستمر أكثر من ثلاثة أيام، أو إذا كنت من كبار السن أو حاملاً أو مصاباً بمرض مزمن. ويبقى لقاح الإنفلونزا السنوي أفضل وسيلة للوقاية.'
  }],

  category: 'Medicines',
  image: '/images/site/blog-cold-flu.webp',
  date: '2026-02-22',
  readMinutes: 6,
  author: {
    name: { en: 'Omar Tariq', ar: 'عمر طارق' },
    role: { en: 'Community Pharmacist', ar: 'صيدلي مجتمعي' }
  }
},
{
  id: 'post-5',
  slug: 'acne-care-routine',
  title: {
    en: 'A Pharmacist’s Guide to Treating Acne at Home',
    ar: 'دليل الصيدلي لعلاج حب الشباب في المنزل'
  },
  excerpt: {
    en: 'Salicylic acid, benzoyl peroxide, niacinamide — which active ingredient suits your skin, and how long before you see results?',
    ar: 'حمض الساليسيليك، وبيروكسيد البنزويل، والنياسيناميد — أي مادة فعالة تناسب بشرتك، ومتى ترى النتائج؟'
  },
  content: [
  {
    en: 'Mild to moderate acne usually responds well to over-the-counter treatment. Salicylic acid unclogs pores and suits blackheads and oily skin; benzoyl peroxide targets the bacteria behind red, inflamed spots.',
    ar: 'يستجيب حب الشباب الخفيف إلى المتوسط عادة للعلاجات المتاحة دون وصفة. يفتح حمض الساليسيليك المسام ويناسب الرؤوس السوداء والبشرة الدهنية، بينما يستهدف بيروكسيد البنزويل البكتيريا المسببة للحبوب الحمراء الملتهبة.'
  },
  {
    en: 'Start slowly — once a day — to limit dryness, and always follow with a non-comedogenic moisturizer and sunscreen. Give any treatment 8 to 12 weeks before judging the results.',
    ar: 'ابدأ تدريجياً بمرة واحدة يومياً للحد من الجفاف، واتبعه دائماً بمرطب لا يسد المسام وواقٍ من الشمس. وامنح أي علاج من 8 إلى 12 أسبوعاً قبل الحكم على نتائجه.'
  },
  {
    en: 'If acne is painful, leaves scars, or does not improve after three months, a dermatologist can prescribe stronger options. Our pharmacists can help you build a routine that suits your skin type.',
    ar: 'إذا كان حب الشباب مؤلماً أو يترك ندوباً أو لم يتحسن بعد ثلاثة أشهر، فبإمكان طبيب الجلدية وصف خيارات أقوى. ويمكن لصيادلتنا مساعدتك في بناء روتين يناسب نوع بشرتك.'
  }],

  category: 'Skincare',
  image: '/images/site/blog-acne.webp',
  date: '2026-02-08',
  readMinutes: 5,
  author: {
    name: { en: 'Dr. Mariam Youssef', ar: 'د. مريم يوسف' },
    role: { en: 'Pharmacist, Skin Care', ar: 'صيدلانية متخصصة في العناية بالبشرة' }
  }
},
{
  id: 'post-6',
  slug: 'building-a-home-first-aid-kit',
  title: {
    en: 'What Every Home First Aid Kit Should Contain',
    ar: 'ما الذي يجب أن تحتويه حقيبة الإسعافات الأولية في كل منزل'
  },
  excerpt: {
    en: 'Small cuts, burns, and fevers happen when you least expect them. A well-stocked kit means you are ready.',
    ar: 'الجروح الصغيرة والحروق والحمى تحدث حين لا تتوقعها. والحقيبة المجهزة جيداً تعني أنك مستعد دائماً.'
  },
  content: [
  {
    en: 'Keep the basics in one place that every adult in the house knows: sterile gauze, plasters in several sizes, adhesive tape, an antiseptic solution, a burn gel, a digital thermometer, and blunt-ended scissors.',
    ar: 'احتفظ بالأساسيات في مكان واحد يعرفه جميع البالغين في المنزل: شاش معقم، ولصقات جروح بأحجام مختلفة، وشريط لاصق، ومحلول مطهر، وجل للحروق، وميزان حرارة رقمي، ومقص ذو أطراف غير حادة.'
  },
  {
    en: 'Add paracetamol and ibuprofen suitable for every age in your family, oral rehydration salts, and an antihistamine for allergic reactions. Keep everything out of children’s reach.',
    ar: 'أضف الباراسيتامول والإيبوبروفين بتركيزات مناسبة لكل الأعمار في عائلتك، وأملاح الإرواء الفموية، ومضاداً للهيستامين لحالات الحساسية. واحفظ كل شيء بعيداً عن متناول الأطفال.'
  },
  {
    en: 'Check expiry dates every six months and replace what you have used. Bring your kit to any Apex Aora Pharmacy branch and our team will check it for free.',
    ar: 'تحقق من تواريخ الصلاحية كل ستة أشهر واستبدل ما استخدمته. أحضر حقيبتك إلى أي فرع من فروع صيدلية أبكس أورا وسيقوم فريقنا بفحصها مجاناً.'
  }],

  category: 'Wellness',
  image: '/images/site/blog-first-aid.webp',
  date: '2026-01-30',
  readMinutes: 4,
  author: {
    name: { en: 'Noura Khalifa', ar: 'نورة خليفة' },
    role: { en: 'Pharmacy Operations Manager', ar: 'مديرة عمليات الصيدلية' }
  }
}];
