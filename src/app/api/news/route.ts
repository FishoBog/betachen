import { NextRequest, NextResponse } from 'next/server';

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

const FALLBACK_ARTICLES = {
  housing: [
    { title: 'Ethiopia Real Estate Market Shows Strong Growth in 2025', description: 'The Ethiopian real estate sector continues to attract significant investment, with Addis Ababa leading in residential and commercial developments. Demand for affordable housing remains high across major cities.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date().toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Condominium Projects Expanding Across Addis Ababa Sub-Cities', description: 'New condominium housing projects are being launched in Bole, Yeka, and Nifas Silk Lafto sub-cities, offering more housing options for middle-income families in the capital.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 86400000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Rental Prices Stabilizing in Key Addis Ababa Districts', description: 'After a period of rapid increases, monthly rental prices in Bole, Kazanchis, and CMC areas are showing signs of stabilization, providing relief for tenants and predictability for investors.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 172800000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Foreign Investment Drives Commercial Real Estate Boom', description: "International investors are increasingly targeting Ethiopian commercial real estate, particularly office spaces and mixed-use developments in Addis Ababa's business districts.", url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 259200000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'New Housing Finance Options Available for Ethiopian Buyers', description: 'Several Ethiopian banks have introduced new mortgage and home loan products, making it easier for first-time buyers to enter the property market with lower down payment requirements.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 345600000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Urban Development Plans Set to Transform Outer Addis Areas', description: 'The Addis Ababa City Administration has announced major urban development plans for outer districts, which are expected to significantly increase property values in those areas over the next five years.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 432000000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
  ],
  economy: [
    { title: 'Ethiopian Economy Posts Strong GDP Growth Despite Regional Challenges', description: "Ethiopia's economy continues to be one of the fastest-growing in Africa, with GDP growth driven by construction, services, and agricultural sectors.", url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date().toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'National Bank of Ethiopia Adjusts Interest Rates to Curb Inflation', description: 'The National Bank of Ethiopia has implemented monetary policy adjustments aimed at bringing inflation under control while maintaining economic growth momentum.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 86400000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Ethiopia Attracts Record Foreign Direct Investment in 2025', description: 'Foreign direct investment into Ethiopia reached new highs, with investors particularly interested in manufacturing, real estate, and infrastructure sectors.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 172800000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Birr Exchange Rate Stabilizes as Export Revenues Increase', description: 'The Ethiopian Birr has shown relative stability against major currencies as export revenues from coffee, gold, and manufactured goods continue to grow.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 259200000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Infrastructure Investment Boom Creating New Economic Opportunities', description: 'Major infrastructure projects including roads, railways, and energy facilities are creating significant economic opportunities and boosting real estate values in connected areas.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 345600000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'SME Growth Driving Demand for Commercial Properties in Ethiopia', description: 'The rapid growth of small and medium enterprises in Ethiopia is creating strong demand for affordable commercial spaces, offices, and retail properties across major urban centers.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 432000000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
  ],
  ethiopia: [
    { title: 'Addis Ababa Master Plan Envisions Major Urban Transformation', description: 'The updated Addis Ababa city master plan outlines ambitious urban development goals for the next two decades, including new satellite cities, improved transit, and expanded green spaces.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date().toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Ethiopia Advances Towards Middle-Income Country Status', description: 'Ethiopia continues making progress towards its goal of becoming a middle-income country, with rising per capita incomes and improving living standards in urban and rural areas.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 86400000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'New Light Rail Expansion to Boost Property Values Along Corridors', description: "Planned expansions of Addis Ababa's light rail transit system are expected to significantly increase property values along new corridors, creating investment opportunities for early buyers.", url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 172800000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Ethiopian Diaspora Investment in Real Estate Continues to Rise', description: 'Ethiopians living abroad are increasingly investing in real estate back home, contributing to demand for premium properties and driving development in key neighborhoods.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 259200000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Tourism Growth Opening New Hospitality Real Estate Opportunities', description: "Ethiopia's growing tourism sector is creating new opportunities in hospitality real estate, with demand for boutique hotels, guesthouses, and serviced apartments rising in key destinations.", url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 345600000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
    { title: 'Green Building Standards Gaining Traction in Ethiopian Construction', description: 'Ethiopian developers are increasingly adopting green building practices and sustainable construction standards, driven by regulatory requirements and growing buyer demand for eco-friendly properties.', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 432000000).toISOString(), source: { name: 'Betachen Market Intelligence' } },
  ],
};

const AMHARIC_FALLBACK = {
  housing: [
    { title: 'የኢትዮጵያ የሪል ስቴት ገበያ በ2025 ጠንካራ እድገት አሳይቷል', description: 'የኢትዮጵያ የሪል ስቴት ዘርፍ ከፍተኛ ኢንቨስትመንትን እየሳበ ሲሆን አዲስ አበባ በቤት ውስጥና ንግድ ልማቶች ቀዳሚ ቦታ ይዛለች። በዋና ዋና ከተሞች ለተመጣጣኝ ዋጋ ቤቶች ፍላጎት ከፍተኛ ሆኖ ቀጥሏል።', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date().toISOString(), source: { name: 'ቤታችን የገበያ ትንታኔ' } },
    { title: 'በአዲስ አበባ ክፍለ ከተሞች የኮንዶሚኒየም ፕሮጀክቶች እየተስፋፉ ነው', description: 'አዲስ አዲስ የኮንዶሚኒየም ፕሮጀክቶች በቦሌ፣ ዬካ እና ንፋስ ስልክ ላፍቶ ክፍለ ከተሞች እየተጀመሩ ሲሆን ለዋና ከተማ መካከለኛ ገቢ ለሚኖራቸው ቤተሰቦች ብዙ የቤት አማራጮችን ያቀርባሉ።', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 86400000).toISOString(), source: { name: 'ቤታችን የገበያ ትንታኔ' } },
    { title: 'በዋና ዋና የአዲስ አበባ ሰፈሮች የኪራይ ዋጋ እየተረጋጋ ነው', description: 'ፈጣን ጭማሪ ከታየ በኋላ፣ በቦሌ፣ ካዛንቺስ እና ሲኤምሲ አካባቢዎች ወርሃዊ የኪራይ ዋጋዎች የመረጋጋት ምልክቶችን እያሳዩ ሲሆን ይህ ለተከራዮች እፎይታ ለባለሀብቶችም ወጥነት ይሰጣቸዋል።', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 172800000).toISOString(), source: { name: 'ቤታችን የገበያ ትንታኔ' } },
    { title: 'የውጭ ኢንቨስትመንት የንግድ ሪል ስቴት ዕድገትን እያፋጠነ ነው', description: 'አለምዓቀፍ ባለሀብቶች በኢትዮጵያ የንግድ ሪል ስቴትን ፣ በተለይ በአዲስ አበባ ቢዝነስ ወረዳዎች ውስጥ ያሉ ቢሮዎችና የተቀናጀ ልማቶችን እያነጣጠሩ ነው።', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 259200000).toISOString(), source: { name: 'ቤታችን የገበያ ትንታኔ' } },
    { title: 'ለኢትዮጵያ ገዢዎች አዲስ የቤት ፋይናንስ አማራጮች ተገኝተዋል', description: 'በርካታ ኢትዮጵያዊ ባንኮች አዲስ የቤት ብድር ምርቶችን አስተዋውቀዋል፣ ይህም ለመጀመሪያ ጊዜ ቤት ለሚገዙ ሰዎች ዝቅተኛ የቅድሚያ ክፍያ ጥያቄዎች ጋር ወደ ንብረት ገበያ ለመገባት ቀላል ያደርጋቸዋል።', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 345600000).toISOString(), source: { name: 'ቤታችን የገበያ ትንታኔ' } },
    { title: 'የከተማ ልማት እቅዶች የአዲስ አበባ ዳርቻ አካባቢዎችን ለመቀየር ተዘጋጅተዋል', description: 'የአዲስ አበባ ከተማ አስተዳደር ለዳርቻ ወረዳዎች ዋና ዋና የከተማ ልማት እቅዶችን አስታውቋል፣ ይህም በሚቀጥሉት አምስት ዓመታት ውስጥ ያሉ አካባቢዎች የንብረት ዋጋ በከፍተኛ ሁኔታ ሊጨምር ይጠበቃል።', url: 'https://betachen.com/market', urlToImage: null, publishedAt: new Date(Date.now() - 432000000).toISOString(), source: { name: 'ቤታችን የገበያ ትንታኔ' } },
  ],
  economy: [
    { title:
