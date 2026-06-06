import { NextRequest, NextResponse } from 'next/server';

// rss2json is a reliable CORS-friendly RSS proxy that works from Vercel
const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

const RSS_FEEDS = {
  housing: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://rss.cnn.com/rss/money_real_estate.rss',
  ],
  economy: [
    'https://feeds.bbci.co.uk/news/business/rss.xml',
    'https://feeds.reuters.com/reuters/businessNews',
  ],
  ethiopia: [
    'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
    'https://rss.dw.com/rdf/rss-en-africa',
  ],
};

const KEYWORDS = {
  housing: ['real estate', 'housing', 'property', 'construction', 'rent', 'mortgage', 'home', 'apartment', 'build'],
  economy: ['economy', 'inflation', 'investment', 'finance', 'GDP', 'bank', 'market', 'trade', 'growth', 'interest rate'],
  ethiopia: ['Ethiopia', 'Africa', 'Addis', 'East Africa', 'development', 'infrastructure'],
};

// Curated fallback articles — always shown if feeds fail
const FALLBACK_ARTICLES = {
  housing: [
    {
      title: 'Ethiopia Real Estate Market Shows Strong Growth in 2025',
      description: 'The Ethiopian real estate sector continues to attract significant investment, with Addis Ababa leading in residential and commercial developments. Demand for affordable housing remains high across major cities.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Condominium Projects Expanding Across Addis Ababa Sub-Cities',
      description: 'New condominium housing projects are being launched in Bole, Yeka, and Nifas Silk Lafto sub-cities, offering more housing options for middle-income families in the capital.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Rental Prices Stabilizing in Key Addis Ababa Districts',
      description: 'After a period of rapid increases, monthly rental prices in Bole, Kazanchis, and CMC areas are showing signs of stabilization, providing relief for tenants and predictability for investors.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Foreign Investment Drives Commercial Real Estate Boom',
      description: 'International investors are increasingly targeting Ethiopian commercial real estate, particularly office spaces and mixed-use developments in Addis Ababa\'s business districts.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'New Housing Finance Options Available for Ethiopian Buyers',
      description: 'Several Ethiopian banks have introduced new mortgage and home loan products, making it easier for first-time buyers to enter the property market with lower down payment requirements.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Urban Development Plans Set to Transform Outer Addis Areas',
      description: 'The Addis Ababa City Administration has announced major urban development plans for outer districts, which are expected to significantly increase property values in those areas over the next five years.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
  ],
  economy: [
    {
      title: 'Ethiopian Economy Posts Strong GDP Growth Despite Regional Challenges',
      description: 'Ethiopia\'s economy continues to be one of the fastest-growing in Africa, with GDP growth driven by construction, services, and agricultural sectors despite ongoing regional challenges.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'National Bank of Ethiopia Adjusts Interest Rates to Curb Inflation',
      description: 'The National Bank of Ethiopia has implemented monetary policy adjustments aimed at bringing inflation under control while maintaining economic growth momentum.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Ethiopia Attracts Record Foreign Direct Investment in 2025',
      description: 'Foreign direct investment into Ethiopia reached new highs, with investors particularly interested in manufacturing, real estate, and infrastructure sectors.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Birr Exchange Rate Stabilizes as Export Revenues Increase',
      description: 'The Ethiopian Birr has shown relative stability against major currencies as export revenues from coffee, gold, and manufactured goods continue to grow.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Infrastructure Investment Boom Creating New Economic Opportunities',
      description: 'Major infrastructure projects including roads, railways, and energy facilities are creating significant economic opportunities and boosting real estate values in connected areas.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'SME Growth Driving Demand for Commercial Properties in Ethiopia',
      description: 'The rapid growth of small and medium enterprises in Ethiopia is creating strong demand for affordable commercial spaces, offices, and retail properties across major urban centers.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
  ],
  ethiopia: [
    {
      title: 'Addis Ababa Master Plan Envisions Major Urban Transformation',
      description: 'The updated Addis Ababa city master plan outlines ambitious urban development goals for the next two decades, including new satellite cities, improved transit, and expanded green spaces.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Ethiopia Advances Towards Middle-Income Country Status',
      description: 'Ethiopia continues making progress towards its goal of becoming a middle-income country, with rising per capita incomes and improving living standards in urban and rural areas.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'New Light Rail Expansion to Boost Property Values Along Corridors',
      description: 'Planned expansions of Addis Ababa\'s light rail transit system are expected to significantly increase property values along new corridors, creating investment opportunities for early buyers.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Ethiopian Diaspora Investment in Real Estate Continues to Rise',
      description: 'Ethiopians living abroad are increasingly investing in real estate back home, contributing to demand for premium properties and driving development in key neighborhoods.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Tourism Growth Opening New Hospitality Real Estate Opportunities',
      description: 'Ethiopia\'s growing tourism sector is creating new opportunities in hospitality real estate, with demand for boutique hotels, guesthouses, and serviced apartments rising in key destinations.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
    {
      title: 'Green Building Standards Gaining Traction in Ethiopian Construction',
      description: 'Ethiopian developers are increasingly adopting green building practices and sustainable construction standards, driven by both regulatory requirements and growing buyer demand for eco-friendly properties.',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      source: { name: 'Betachen Market Intelligence' },
    },
  ],
};

const AMHARIC_FALLBACK = {
  housing: [
    {
      title: 'የኢትዮጵያ የሪል ስቴት ገበያ በ2025 ጠንካራ እድገት አሳይቷል',
      description: 'የኢትዮጵያ የሪል ስቴት ዘርፍ ከፍተኛ ኢንቨስትመንትን እየሳበ ሲሆን አዲስ አበባ በቤት ውስጥና ንግድ ልማቶች ቀዳሚ ቦታ ይዛለች። በዋና ዋና ከተሞች ለተመጣጣኝ ዋጋ ቤቶች ፍላጎት ከፍተኛ ሆኖ ቀጥሏል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'በአዲስ አበባ ክፍለ ከተሞች የኮንዶሚኒየም ፕሮጀክቶች እየተስፋፉ ነው',
      description: 'አዲስ አዲስ የኮንዶሚኒየም ፕሮጀክቶች በቦሌ፣ ዬካ እና ንፋስ ስልክ ላፍቶ ክፍለ ከተሞች እየተጀመሩ ሲሆን ለዋና ከተማ መካከለኛ ገቢ ለሚኖራቸው ቤተሰቦች ብዙ የቤት አማራጮችን ያቀርባሉ።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'በዋና ዋና የአዲስ አበባ ሰፈሮች የኪራይ ዋጋ እየተረጋጋ ነው',
      description: 'ፈጣን ጭማሪ ከታየ በኋላ፣ በቦሌ፣ ካዛንቺስ እና ሲኤምሲ አካባቢዎች ወርሃዊ የኪራይ ዋጋዎች የመረጋጋት ምልክቶችን እያሳዩ ሲሆን ይህ ለተከራዮች እፎይታ ለባለሀብቶችም ወጥነት ይሰጣቸዋል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'የውጭ ኢንቨስትመንት የንግድ ሪል ስቴት ዕድገትን እያፋጠነ ነው',
      description: 'አለምዓቀፍ ባለሀብቶች በኢትዮጵያ የንግድ ሪል ስቴትን ፣ በተለይ በአዲስ አበባ ቢዝነስ ወረዳዎች ውስጥ ያሉ ቢሮዎችና የተቀናጀ ልማቶችን እያነጣጠሩ ነው።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'ለኢትዮጵያ ገዢዎች አዲስ የቤት ፋይናንስ አማራጮች ተገኝተዋል',
      description: 'በርካታ ኢትዮጵያዊ ባንኮች አዲስ የቤት ብድር ምርቶችን አስተዋውቀዋል፣ ይህም ለመጀመሪያ ጊዜ ቤት ለሚገዙ ሰዎች ዝቅተኛ የቅድሚያ ክፍያ ጥያቄዎች ጋር ወደ ንብረት ገበያ ለመገባት ቀላል ያደርጋቸዋል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'የከተማ ልማት እቅዶች የአዲስ አበባ ዳርቻ አካባቢዎችን ለመቀየር ተዘጋጅተዋል',
      description: 'የአዲስ አበባ ከተማ አስተዳደር ለዳርቻ ወረዳዎች ዋና ዋና የከተማ ልማት እቅዶችን አስታውቋል፣ ይህም በሚቀጥሉት አምስት ዓመታት ውስጥ ያሉ አካባቢዎች የንብረት ዋጋ በከፍተኛ ሁኔታ ሊጨምር ይጠበቃል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
  ],
  economy: [
    {
      title: 'የኢትዮጵያ ኢኮኖሚ ቢሆንም ጠንካራ የጂዲፒ እድገት አሳይቷል',
      description: 'የኢትዮጵያ ኢኮኖሚ በአፍሪካ ከፍተኛ ዕድገት ካሳዩ አንዱ ሆኖ ቀጥሏል፣ የጂዲፒ ዕድገት በግንባታ፣ አገልግሎቶች እና የግብርና ዘርፎች ሲመራ ቆይቷል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'የኢትዮጵያ ብሔራዊ ባንክ የዋጋ ንረትን ለመቆጣጠር የወለድ ተመኖችን አስተካክሏል',
      description: 'የኢትዮጵያ ብሔራዊ ባንክ የኢኮኖሚ ዕድገት ሞመንተምን እያስጠበቀ የዋጋ ንረትን ለመቆጣጠር የሚያለምቅ የገንዘብ ፖሊሲ ማስተካከያዎችን ተግባራዊ አድርጓል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'ኢትዮጵያ በ2025 ሪከርድ የቀጥታ የውጭ ኢንቨስትመንት ስቧለች',
      description: 'ወደ ኢትዮጵያ የሚገባ ቀጥታ የውጭ ኢንቨስትመንት አዲስ ከፍታ ላይ ደርሷል፣ ባለሀብቶቹ በተለይ ማኑፋክቸሪንግ፣ ሪል ስቴት እና የመሠረተ ልማት ዘርፎች ላይ ፍላጎት አሳይተዋል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'የወጪ ንግድ ገቢ ሲጨምር የብር ምንዛሪ ተረጋጋ',
      description: 'ከቡና፣ ወርቅ እና ማኑፋክቸርድ ዕቃዎች የሚገኘው የወጪ ንግድ ገቢ እያደገ ሲሄድ የኢትዮጵያ ብር ዋና ዋና ምንዛሪዎች አንጻር አንጻራዊ መረጋጋት አሳይቷል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'የመሠረተ ልማት ኢንቨስትመንት ዕድገት አዲስ ኢኮኖሚያዊ ዕድሎችን እየፈጠረ ነው',
      description: 'ትላልቅ የመሠረተ ልማት ፕሮጀክቶች ጉልህ ኢኮኖሚያዊ ዕድሎችን እየፈጠሩ ሲሆን ከተሳሰሩ አካባቢዎች ውስጥ ያሉ ሪል ስቴቶችን ዋጋ ከፍ እያደረጉ ነው።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'የኤስኤምኢ ዕድገት በኢትዮጵያ ለንግድ ንብረቶች ፍላጎት እያሳደገ ነው',
      description: 'በኢትዮጵያ የጥቃቅና አነስተኛ ኢንተርፕራይዞች ፈጣን ዕድገት ለተወጣጣሪ የንግድ ቦታዎች፣ ቢሮዎች እና የሸቀጥ ሱቅ ንብረቶች ጠንካራ ፍላጎት እየፈጠረ ነው።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
  ],
  ethiopia: [
    {
      title: 'የአዲስ አበባ ማስተር ፕላን ዋና ዋና የከተማ ለውጥ ያስባል',
      description: 'የተዘመነው የአዲስ አበባ ከተማ ማስተር ፕላን አዳዲስ ሳተላይት ከተሞች፣ የተሻሻለ ትራንዚት እና የተስፋፉ አረንጓዴ ቦታዎችን ጨምሮ ለሚቀጥሉት ሁለት አስርት ዓመታት ምኞታዊ የከተማ ልማት ግቦችን ያስቀምጣል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'ኢትዮጵያ ወደ መካከለኛ ገቢ ሀገር ደረጃ እየገሰገሰ ነው',
      description: 'ኢትዮጵያ መካከለኛ ገቢ ሀገር የመሆን ግቧ ላይ ለማሳካት ሂደቷን ቀጥላለች፣ የነፍስ ወከፍ ገቢ እየጨመረ ሲሆን በከተማ እና በገጠር አካባቢዎች ኑሮ እየሻሻለ ነው።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'አዲስ ቀላል ባቡር ማስፋፊያ በሰርጦቹ ላይ ያሉ የንብረት ዋጋዎችን ሊያሳድግ ይጠበቃል',
      description: 'የታቀዱ የአዲስ አበባ ቀላል ባቡር ማጓጓዣ ስርዓት ማስፋፊያዎች በአዲስ ሰርጦቹ ላይ ያሉ የንብረት ዋጋዎችን በከፍተኛ ሁኔታ ሊጨምሩ ይጠበቃል፣ ይህም ለቀደምት ገዢዎች የኢንቨስትመንት ዕድሎችን ይፈጥራል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'በሪል ስቴት ውስጥ ያሉ የኢትዮጵያ ዲያስፖራ ኢንቨስትመንት እየጨመረ ነው',
      description: 'በውጭ አገር የሚኖሩ ኢትዮጵያውያን ወደ ቤታቸው ሀገር ሪል ስቴት ኢንቨስትምነት እያደረጉ ሲሆን ይህ ለፕሪሚየም ንብረቶች ፍላጎት አስተዋፅዖ አድርጓል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'የቱሪዝም ዕድገት አዲስ የእንግዳ ማረፊያ ሪል ስቴት ዕድሎችን እየከፈተ ነው',
      description: 'የኢትዮጵያ እያደገ ያለ የቱሪዝም ዘርፍ አዳዲስ የእንግዳ ማረፊያ ሪል ስቴት ዕድሎችን እየፈጠረ ሲሆን ፍላጎቱ በቡቲክ ሆቴሎች፣ ማረፊያ ቤቶች እና አገልግሎቶች ያሏቸው አፓርትመንቶች ላይ ከፍ ብሏል።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
    {
      title: 'አረንጓዴ ህንጻ ደረጃዎች በኢትዮጵያ ግንባታ ላይ ተቀባይነት እያገኙ ነው',
      description: 'የኢትዮጵያ ልማት ባለሙያዎች አረንጓዴ ህንጻ አሰራሮችን እና ዘላቂ የግንባታ ደረጃዎችን እየተቀበሉ ሲሆን ይህ በቁጥጥር መስፈርቶች እና ለኢኮ-ወዳጅ ንብረቶች ከፍ ያለ ፍላጎት ያሳዩ ገዢዎች ነው።',
      url: 'https://betachen.com/market',
      urlToImage: null,
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      source: { name: 'ቤታችን የገበያ ትንታኔ' },
    },
  ],
};

async function fetchViaRss2Json(feedUrl: string, count = 6): Promise<any[]> {
  try {
    const url = `${RSS2JSON}?rss_url=${encodeURIComponent(feedUrl)}&count=${count}&order_by=pubDate&order_dir=desc`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.items)) return [];
    return data.items.map((item: any) => ({
      title: item.title ?? '',
      description: (item.description ?? item.content ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&#160;|&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .trim()
        .slice(0, 300),
      url: item.link ?? '#',
      urlToImage: item.thumbnail || item.enclosure?.link || null,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      source: { name: item.feed_url ? new URL(item.feed_url).hostname.replace('www.', '') : data.feed?.title ?? 'News' },
    })).filter((a: any) => a.title);
  } catch {
    return [];
  }
}

async function translateToAmharic(articles: any[]): Promise<any[]> {
  if (!process.env.ANTHROPIC_API_KEY) return articles;
  try {
    const textsToTranslate = articles.map(a => ({
      title: a.title,
      description: a.description,
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Translate these news articles to Amharic (Ethiopian Fidel script). Return ONLY a valid JSON array, no markdown, no explanation, no code blocks. Each object must have "title" and "description" string fields.\n\nInput: ${JSON.stringify(textsToTranslate)}`,
        }],
      }),
    });

    if (!response.ok) return articles;
    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? '';
    const clean = rawText.replace(/```json|```/g, '').trim();
    const translated = JSON.parse(clean);
    if (!Array.isArray(translated)) return articles;

    return articles.map((a, i) => ({
      ...a,
      title: translated[i]?.title ?? a.title,
      description: translated[i]?.description ?? a.description,
    }));
  } catch (e) {
    console.error('Translation error:', e);
    return articles;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tab = (searchParams.get('tab') ?? 'housing') as keyof typeof RSS_FEEDS;
  const lang = searchParams.get('lang') ?? 'EN';

  // If Amharic, return pre-written Amharic fallback immediately (fast + reliable)
  // Still try live feeds and translate, but fallback is ready
  const feeds = RSS_FEEDS[tab] ?? RSS_FEEDS.housing;
  const keywords = KEYWORDS[tab] ?? KEYWORDS.housing;

  // Try fetching live news via rss2json
  let articles: any[] = [];
  try {
    const results = await Promise.all(feeds.map(f => fetchViaRss2Json(f, 6)));
    articles = results.flat();
  } catch {
    articles = [];
  }

  // Filter by keywords
  if (articles.length > 0) {
    const filtered = articles.filter(a =>
      keywords.some(kw =>
        a.title.toLowerCase().includes(kw.toLowerCase()) ||
        a.description.toLowerCase().includes(kw.toLowerCase())
      )
    );
    if (filtered.length >= 3) articles = filtered;
  }

  // Deduplicate
  const seen = new Set();
  articles = articles.filter(a => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  articles = articles.slice(0, 9);

  // If no live articles, use fallback
  if (articles.length < 3) {
    if (lang === 'AM') {
      return NextResponse.json({
        articles: AMHARIC_FALLBACK[tab] ?? AMHARIC_FALLBACK.housing,
        source: 'fallback',
      });
    }
    return NextResponse.json({
      articles: FALLBACK_ARTICLES[tab] ?? FALLBACK_ARTICLES.housing,
      source: 'fallback',
    });
  }

  // Translate if Amharic
  const final = lang === 'AM' ? await translateToAmharic(articles) : articles;

  return NextResponse.json({ articles: final, source: 'live' });
}
