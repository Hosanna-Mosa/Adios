import SupportIntent from "../../database/models/SupportIntent";

type L = { en: string; te: string; hi: string };
interface Seed {
  key: string;
  category: "ride" | "food" | "meat" | "package" | "helper" | "payment" | "general";
  question: L;
  resolver: string;
  needsOrder: boolean;
  staticAnswer?: L;
}

// Starter questions, drawn from the topics the big ride / food / delivery help centres cover and
// mapped onto our services. Admin can edit, translate, disable or add to them; seeding only
// inserts a question that doesn't exist yet (by key), so admin edits are never overwritten.
// The te/hi text is machine-quality and should be reviewed by a native speaker.
const SEEDS: Seed[] = [
  // ---- ride ----
  { key: "ride_where", category: "ride", resolver: "orderStatus", needsOrder: true,
    question: { en: "Where is my ride?", te: "నా రైడ్ ఎక్కడ ఉంది?", hi: "मेरी राइड कहाँ है?" } },
  { key: "ride_no_driver", category: "ride", resolver: "driverAssignment", needsOrder: true,
    question: { en: "Why is no driver assigned yet?", te: "ఇంకా డ్రైవర్ ఎందుకు నియమించబడలేదు?", hi: "अभी तक ड्राइवर असाइन क्यों नहीं हुआ?" } },
  { key: "ride_cancelled", category: "ride", resolver: "whyCancelled", needsOrder: true,
    question: { en: "Why was my ride cancelled?", te: "నా రైడ్ ఎందుకు రద్దయింది?", hi: "मेरी राइड क्यों रद्द हुई?" } },
  { key: "ride_fare", category: "ride", resolver: "fareBreakdown", needsOrder: true,
    question: { en: "Why was I charged this fare?", te: "ఈ ఛార్జ్ ఎందుకు పడింది?", hi: "यह किराया क्यों लगा?" } },
  { key: "ride_cancel_fee", category: "ride", resolver: "static", needsOrder: false,
    question: { en: "I was charged a cancellation fee", te: "నాకు క్యాన్సలేషన్ ఫీజు వేశారు", hi: "मुझसे कैंसलेशन फ़ीस ली गई" },
    staticAnswer: {
      en: "A cancellation fee can apply when a ride is cancelled after a driver has already been assigned and is on the way. If you think it was charged unfairly, tap Talk to an agent and we will review it.",
      te: "డ్రైవర్ నియమించబడి వస్తున్న తర్వాత రైడ్ రద్దు చేస్తే క్యాన్సలేషన్ ఫీజు వర్తించవచ్చు. అన్యాయంగా వేశారని అనిపిస్తే ఏజెంట్‌తో మాట్లాడండి, మేము సమీక్షిస్తాము.",
      hi: "ड्राइवर असाइन होकर रास्ते में आने के बाद राइड रद्द करने पर कैंसलेशन फ़ीस लग सकती है। अगर आपको लगता है कि यह गलत लगी है, तो एजेंट से बात करें, हम जाँच करेंगे।",
    } },
  { key: "ride_otp", category: "ride", resolver: "static", needsOrder: false,
    question: { en: "My ride OTP isn't working", te: "నా రైడ్ OTP పని చేయడం లేదు", hi: "मेरा राइड OTP काम नहीं कर रहा" },
    staticAnswer: {
      en: "Share the OTP shown on your tracking screen only with the driver who has reached you, and check you are in the right vehicle. If it still doesn't work, tap Talk to an agent.",
      te: "మీ ట్రాకింగ్ స్క్రీన్‌లో కనిపించే OTP ని మీ దగ్గరకు వచ్చిన డ్రైవర్‌కు మాత్రమే చెప్పండి, సరైన వాహనంలో ఉన్నారో చూడండి. అయినా పని చేయకపోతే ఏజెంట్‌తో మాట్లాడండి.",
      hi: "ट्रैकिंग स्क्रीन पर दिखने वाला OTP केवल आपके पास पहुँचे ड्राइवर को बताएँ और देखें कि आप सही गाड़ी में हैं। फिर भी काम न करे तो एजेंट से बात करें।",
    } },
  { key: "ride_lost_item", category: "ride", resolver: "static", needsOrder: false,
    question: { en: "I lost an item in my ride", te: "నా రైడ్‌లో వస్తువు పోగొట్టుకున్నాను", hi: "मैं राइड में अपना सामान भूल गया" },
    staticAnswer: {
      en: "Please tap Talk to an agent right away and tell us the ride and the item. We will contact the driver to get it back to you.",
      te: "దయచేసి వెంటనే ఏజెంట్‌తో మాట్లాడండి, రైడ్ మరియు వస్తువు వివరాలు చెప్పండి. మేము డ్రైవర్‌ను సంప్రదించి తిరిగి ఇప్పిస్తాము.",
      hi: "कृपया तुरंत एजेंट से बात करें और राइड व सामान की जानकारी दें। हम ड्राइवर से संपर्क करके सामान वापस दिलाने की कोशिश करेंगे।",
    } },

  // ---- food ----
  { key: "food_where", category: "food", resolver: "orderStatus", needsOrder: true,
    question: { en: "Where is my order?", te: "నా ఆర్డర్ ఎక్కడ ఉంది?", hi: "मेरा ऑर्डर कहाँ है?" } },
  { key: "food_late", category: "food", resolver: "orderStatus", needsOrder: true,
    question: { en: "Why is my order late?", te: "నా ఆర్డర్ ఎందుకు ఆలస్యం అవుతోంది?", hi: "मेरा ऑर्डर देर से क्यों आ रहा है?" } },
  { key: "food_cancelled", category: "food", resolver: "whyCancelled", needsOrder: true,
    question: { en: "Why was my order cancelled?", te: "నా ఆర్డర్ ఎందుకు రద్దయింది?", hi: "मेरा ऑर्डर क्यों रद्द हुआ?" } },
  { key: "food_accept", category: "food", resolver: "orderStatus", needsOrder: true,
    question: { en: "When will the restaurant accept my order?", te: "రెస్టారెంట్ నా ఆర్డర్‌ను ఎప్పుడు అంగీకరిస్తుంది?", hi: "रेस्टोरेंट मेरा ऑर्डर कब स्वीकार करेगा?" } },
  { key: "food_missing", category: "food", resolver: "static", needsOrder: false,
    question: { en: "Items are missing or wrong in my order", te: "నా ఆర్డర్‌లో వస్తువులు లేవు లేదా తప్పుగా ఉన్నాయి", hi: "मेरे ऑर्डर में सामान कम या गलत है" },
    staticAnswer: {
      en: "Sorry about that. Please tap Talk to an agent and tell us which items were missing or wrong, with a photo if you can. We will check with the restaurant and sort out a refund or replacement.",
      te: "క్షమించండి. దయచేసి ఏజెంట్‌తో మాట్లాడి ఏ వస్తువులు లేవో లేదా తప్పో చెప్పండి, వీలైతే ఫోటో పంపండి. రెస్టారెంట్‌తో మాట్లాడి వాపసు లేదా రీప్లేస్‌మెంట్ ఏర్పాటు చేస్తాము.",
      hi: "इसके लिए क्षमा करें। कृपया एजेंट से बात करें और बताएँ कि कौन सा सामान कम या गलत था, हो सके तो फ़ोटो भेजें। हम रेस्टोरेंट से बात करके रिफ़ंड या बदलाव करवाएँगे।",
    } },

  // ---- meat ----
  { key: "meat_where", category: "meat", resolver: "orderStatus", needsOrder: true,
    question: { en: "Where is my meat order?", te: "నా మాంసం ఆర్డర్ ఎక్కడ ఉంది?", hi: "मेरा मीट ऑर्डर कहाँ है?" } },
  { key: "meat_schedule", category: "meat", resolver: "scheduledDelivery", needsOrder: true,
    question: { en: "When is my scheduled delivery?", te: "నా షెడ్యూల్డ్ డెలివరీ ఎప్పుడు?", hi: "मेरी शेड्यूल्ड डिलीवरी कब है?" } },
  { key: "meat_cancelled", category: "meat", resolver: "whyCancelled", needsOrder: true,
    question: { en: "Why was my meat order cancelled?", te: "నా మాంసం ఆర్డర్ ఎందుకు రద్దయింది?", hi: "मेरा मीट ऑर्डर क्यों रद्द हुआ?" } },

  // ---- package ----
  { key: "package_where", category: "package", resolver: "orderStatus", needsOrder: true,
    question: { en: "Where is my parcel?", te: "నా పార్సెల్ ఎక్కడ ఉంది?", hi: "मेरा पार्सल कहाँ है?" } },
  { key: "package_not_picked", category: "package", resolver: "driverAssignment", needsOrder: true,
    question: { en: "Why hasn't my parcel been picked up?", te: "నా పార్సెల్ ఎందుకు ఇంకా తీసుకోలేదు?", hi: "मेरा पार्सल अभी तक पिकअप क्यों नहीं हुआ?" } },
  { key: "package_cancelled", category: "package", resolver: "whyCancelled", needsOrder: true,
    question: { en: "Why was my delivery cancelled?", te: "నా డెలివరీ ఎందుకు రద్దయింది?", hi: "मेरी डिलीवरी क्यों रद्द हुई?" } },

  // ---- helper ----
  { key: "helper_assigned", category: "helper", resolver: "helperTask", needsOrder: true,
    question: { en: "Has a helper been assigned to my task?", te: "నా టాస్క్‌కు హెల్పర్ నియమించబడ్డారా?", hi: "क्या मेरे टास्क के लिए हेल्पर असाइन हुआ?" } },
  { key: "helper_cancelled", category: "helper", resolver: "whyCancelled", needsOrder: true,
    question: { en: "Why was my task cancelled?", te: "నా టాస్క్ ఎందుకు రద్దయింది?", hi: "मेरा टास्क क्यों रद्द हुआ?" } },
  { key: "helper_price", category: "helper", resolver: "helperPricing", needsOrder: false,
    question: { en: "How is my task price calculated?", te: "నా టాస్క్ ధర ఎలా లెక్కిస్తారు?", hi: "मेरे टास्क की कीमत कैसे तय होती है?" } },

  // ---- payments ----
  { key: "pay_refund", category: "payment", resolver: "refundStatus", needsOrder: true,
    question: { en: "Where is my refund?", te: "నా వాపసు ఎక్కడ?", hi: "मेरा रिफ़ंड कहाँ है?" } },
  { key: "pay_deducted", category: "payment", resolver: "paymentIssue", needsOrder: false,
    question: { en: "Money was deducted but my order wasn't placed", te: "డబ్బు కట్ అయింది కానీ ఆర్డర్ కాలేదు", hi: "पैसे कट गए लेकिन ऑर्डर नहीं हुआ" } },
  { key: "pay_topup_refund", category: "payment", resolver: "refundStatus", needsOrder: true,
    question: { en: "Refund for the extra amount I added", te: "నేను జోడించిన అదనపు మొత్తం వాపసు", hi: "मेरे जोड़े गए अतिरिक्त पैसे का रिफ़ंड" } },

  // ---- general ----
  { key: "general_language", category: "general", resolver: "static", needsOrder: false,
    question: { en: "How do I change the app language?", te: "యాప్ భాషను ఎలా మార్చాలి?", hi: "ऐप की भाषा कैसे बदलें?" },
    staticAnswer: {
      en: "Open the Profile tab, tap Language, and choose English, తెలుగు or हिन्दी. The whole app switches straight away.",
      te: "ప్రొఫైల్ ట్యాబ్ తెరిచి, భాష ను నొక్కి, English, తెలుగు లేదా हिन्दी ఎంచుకోండి. యాప్ వెంటనే మారుతుంది.",
      hi: "प्रोफ़ाइल टैब खोलें, भाषा पर टैप करें और English, తెలుగు या हिन्दी चुनें। पूरा ऐप तुरंत बदल जाएगा।",
    } },
];

export async function seedSupportIntents() {
  const ops = SEEDS.map((seed, i) => ({
    updateOne: {
      filter: { key: seed.key },
      update: { $setOnInsert: { ...seed, enabled: true, sortOrder: (i + 1) * 10, helpfulCount: 0, notHelpfulCount: 0 } },
      upsert: true,
    },
  }));
  const result = await SupportIntent.bulkWrite(ops);
  if (result.upsertedCount) console.log(`Seeded ${result.upsertedCount} support bot questions`);
}
