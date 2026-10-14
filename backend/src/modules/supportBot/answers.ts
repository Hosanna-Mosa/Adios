import type { SupportBotLang } from "../../database/models/SupportBotQuery";

export type AnswerParams = Record<string, string | number | undefined>;
export interface AnswerPart {
  key: string;
  params?: AnswerParams;
}

type Template = Record<SupportBotLang, string>;

// Plain-text answer fragments, in the three languages the apps support. A resolver returns a
// list of { key, params } parts and renderAnswer() joins them, so a fragment never has to
// know what comes before or after it. Placeholders are {name}.
export const ANSWER_TEMPLATES: Record<string, Template> = {
  // ---- no data -----------------------------------------------------------------------------
  noOrder: {
    en: "We couldn't find a recent {category} order on your account. If you placed one just now, please wait a minute and try again, or talk to an agent.",
    te: "మీ ఖాతాలో ఇటీవలి {category} ఆర్డర్ కనబడలేదు. ఇప్పుడే ఆర్డర్ చేసి ఉంటే, ఒక నిమిషం ఆగి మళ్లీ ప్రయత్నించండి లేదా ఏజెంట్‌తో మాట్లాడండి.",
    hi: "आपके खाते में हाल का कोई {category} ऑर्डर नहीं मिला। अगर आपने अभी ऑर्डर किया है तो एक मिनट रुककर दोबारा कोशिश करें, या एजेंट से बात करें।",
  },
  orderMissing: {
    en: "We couldn't find that order. Please pick one of your recent orders and try again.",
    te: "ఆ ఆర్డర్ కనబడలేదు. మీ ఇటీవలి ఆర్డర్లలో ఒకదాన్ని ఎంచుకుని మళ్లీ ప్రయత్నించండి.",
    hi: "वह ऑर्डर नहीं मिला। कृपया अपने हाल के ऑर्डर में से एक चुनें और दोबारा कोशिश करें।",
  },

  // ---- where is my order / ride ------------------------------------------------------------
  stAwaitRestaurant: {
    en: "Order #{ref} is placed and is waiting for the restaurant to accept it. If they don't accept in time, it is cancelled automatically and any online payment is refunded.",
    te: "ఆర్డర్ #{ref} ఇవ్వబడింది, రెస్టారెంట్ అంగీకరించడం కోసం వేచి ఉంది. వారు సమయానికి అంగీకరించకపోతే ఆర్డర్ ఆటోమేటిక్‌గా రద్దవుతుంది, ఆన్‌లైన్ చెల్లింపు వాపసు అవుతుంది.",
    hi: "ऑर्डर #{ref} दे दिया गया है और रेस्टोरेंट के स्वीकार करने का इंतज़ार है। अगर वे समय पर स्वीकार नहीं करते तो ऑर्डर अपने आप रद्द हो जाएगा और ऑनलाइन भुगतान वापस हो जाएगा।",
  },
  stPreparing: {
    en: "Order #{ref} was accepted and is being prepared{prep}. We are lining up a delivery partner for pickup.",
    te: "ఆర్డర్ #{ref} అంగీకరించబడింది, తయారు చేస్తున్నారు{prep}. పికప్ కోసం డెలివరీ పార్ట్‌నర్‌ను ఏర్పాటు చేస్తున్నాము.",
    hi: "ऑर्डर #{ref} स्वीकार हो गया है और तैयार किया जा रहा है{prep}। पिकअप के लिए डिलीवरी पार्टनर तय किया जा रहा है।",
  },
  prepSuffix: {
    en: " (about {minutes} min)",
    te: " (సుమారు {minutes} నిమిషాలు)",
    hi: " (लगभग {minutes} मिनट)",
  },
  stSearching: {
    en: "We are searching for a driver for #{ref}. This usually takes a few minutes; you will be notified as soon as someone accepts.",
    te: "#{ref} కోసం డ్రైవర్ కోసం వెతుకుతున్నాము. సాధారణంగా కొన్ని నిమిషాలు పడుతుంది; ఎవరైనా అంగీకరించగానే మీకు తెలియజేస్తాము.",
    hi: "#{ref} के लिए ड्राइवर ढूँढा जा रहा है। इसमें आमतौर पर कुछ मिनट लगते हैं; किसी के स्वीकार करते ही आपको सूचना मिलेगी।",
  },
  stAssigned: {
    en: "{driver} has been assigned to #{ref} and is on the way to the pickup point. You can follow them live on the tracking screen.",
    te: "#{ref} కోసం {driver} నియమించబడ్డారు, పికప్ పాయింట్ వైపు వస్తున్నారు. ట్రాకింగ్ స్క్రీన్‌లో లైవ్‌గా చూడవచ్చు.",
    hi: "#{ref} के लिए {driver} को असाइन किया गया है और वे पिकअप पॉइंट की ओर आ रहे हैं। ट्रैकिंग स्क्रीन पर लाइव देख सकते हैं।",
  },
  stArrived: {
    en: "{driver} has reached the pickup point for #{ref}.",
    te: "#{ref} కోసం {driver} పికప్ పాయింట్‌కు చేరుకున్నారు.",
    hi: "#{ref} के लिए {driver} पिकअप पॉइंट पर पहुँच गए हैं।",
  },
  stPicking: {
    en: "{driver} is collecting your items for #{ref}.",
    te: "#{ref} కోసం {driver} మీ వస్తువులను తీసుకుంటున్నారు.",
    hi: "#{ref} के लिए {driver} आपका सामान ले रहे हैं।",
  },
  stOnTheWay: {
    en: "#{ref} is on the way to you with {driver}. Track the live location on the tracking screen.",
    te: "#{ref} {driver} తో మీ వైపు వస్తోంది. ట్రాకింగ్ స్క్రీన్‌లో లైవ్ లొకేషన్ చూడండి.",
    hi: "#{ref} {driver} के साथ आपकी ओर आ रहा है। ट्रैकिंग स्क्रीन पर लाइव लोकेशन देखें।",
  },
  stInProgress: {
    en: "#{ref} is in progress with {driver}.",
    te: "#{ref} {driver} తో కొనసాగుతోంది.",
    hi: "#{ref} {driver} के साथ जारी है।",
  },
  stDelivered: {
    en: "#{ref} has been completed. If something is wrong with it, ask \"Why was I charged this fare?\" or talk to an agent.",
    te: "#{ref} పూర్తయింది. ఏదైనా సమస్య ఉంటే \"ఈ ఛార్జ్ ఎందుకు పడింది?\" అని అడగండి లేదా ఏజెంట్‌తో మాట్లాడండి.",
    hi: "#{ref} पूरा हो चुका है। कुछ गड़बड़ हो तो \"यह किराया क्यों लगा?\" पूछें या एजेंट से बात करें।",
  },
  stCancelled: {
    en: "#{ref} was cancelled. Ask \"Why was my order cancelled?\" to see the reason and refund status.",
    te: "#{ref} రద్దయింది. కారణం, వాపసు స్థితి కోసం \"నా ఆర్డర్ ఎందుకు రద్దయింది?\" అని అడగండి.",
    hi: "#{ref} रद्द हो गया था। कारण और रिफ़ंड की स्थिति जानने के लिए \"मेरा ऑर्डर क्यों रद्द हुआ?\" पूछें।",
  },
  stUnknown: {
    en: "#{ref} is currently in status \"{status}\". Open the tracking screen for the latest update.",
    te: "#{ref} ప్రస్తుత స్థితి \"{status}\". తాజా సమాచారం కోసం ట్రాకింగ్ స్క్రీన్ తెరవండి.",
    hi: "#{ref} की मौजूदा स्थिति \"{status}\" है। ताज़ा जानकारी के लिए ट्रैकिंग स्क्रीन खोलें।",
  },

  // ---- why was it cancelled ----------------------------------------------------------------
  notCancelled: {
    en: "#{ref} is not cancelled; it is currently active. Open the tracking screen to see where it is.",
    te: "#{ref} రద్దు కాలేదు; ప్రస్తుతం కొనసాగుతోంది. ఎక్కడ ఉందో చూడటానికి ట్రాకింగ్ స్క్రీన్ తెరవండి.",
    hi: "#{ref} रद्द नहीं हुआ है; अभी चालू है। कहाँ है यह देखने के लिए ट्रैकिंग स्क्रीन खोलें।",
  },
  cancelRestaurantRejected: {
    en: "#{ref} was cancelled because the restaurant couldn't take your order.",
    te: "రెస్టారెంట్ మీ ఆర్డర్‌ను తీసుకోలేకపోవడంతో #{ref} రద్దయింది.",
    hi: "रेस्टोरेंट आपका ऑर्डर नहीं ले पाया, इसलिए #{ref} रद्द हो गया।",
  },
  cancelRestaurantTimeout: {
    en: "#{ref} was cancelled because the restaurant didn't accept it in time.",
    te: "రెస్టారెంట్ సమయానికి అంగీకరించకపోవడంతో #{ref} రద్దయింది.",
    hi: "रेस्टोरेंट ने समय पर स्वीकार नहीं किया, इसलिए #{ref} रद्द हो गया।",
  },
  cancelDriver: {
    en: "#{ref} was cancelled because the driver cancelled the trip.",
    te: "డ్రైవర్ ట్రిప్‌ను రద్దు చేయడంతో #{ref} రద్దయింది.",
    hi: "ड्राइवर ने ट्रिप रद्द कर दी, इसलिए #{ref} रद्द हो गया।",
  },
  cancelAdmin: {
    en: "#{ref} was cancelled by our support team.",
    te: "మా సపోర్ట్ టీమ్ #{ref} ని రద్దు చేసింది.",
    hi: "हमारी सपोर्ट टीम ने #{ref} रद्द कर दिया।",
  },
  cancelCustomer: {
    en: "#{ref} was cancelled from your account.",
    te: "మీ ఖాతా నుండి #{ref} రద్దు చేయబడింది.",
    hi: "आपके खाते से #{ref} रद्द किया गया था।",
  },
  cancelNoHelpers: {
    en: "#{ref} was cancelled because no helper accepted the task in time.",
    te: "సమయానికి ఏ హెల్పర్ టాస్క్‌ను అంగీకరించకపోవడంతో #{ref} రద్దయింది.",
    hi: "समय पर किसी हेल्पर ने टास्क स्वीकार नहीं किया, इसलिए #{ref} रद्द हो गया।",
  },
  cancelNoDriver: {
    en: "#{ref} was cancelled because no driver was available nearby.",
    te: "సమీపంలో డ్రైవర్ అందుబాటులో లేకపోవడంతో #{ref} రద్దయింది.",
    hi: "आस-पास कोई ड्राइवर उपलब्ध नहीं था, इसलिए #{ref} रद्द हो गया।",
  },
  cancelUnknown: {
    en: "#{ref} was cancelled, but no reason was recorded. Please talk to an agent and we will check it for you.",
    te: "#{ref} రద్దయింది, కానీ కారణం నమోదు కాలేదు. దయచేసి ఏజెంట్‌తో మాట్లాడండి, మేము పరిశీలిస్తాము.",
    hi: "#{ref} रद्द हुआ, लेकिन कारण दर्ज नहीं है। कृपया एजेंट से बात करें, हम जाँच करेंगे।",
  },

  // ---- refunds -----------------------------------------------------------------------------
  refundCash: {
    en: "You chose cash on delivery, so nothing was charged and there is nothing to refund.",
    te: "మీరు క్యాష్ ఆన్ డెలివరీ ఎంచుకున్నారు, కాబట్టి ఛార్జ్ చేయలేదు; వాపసు అవసరం లేదు.",
    hi: "आपने कैश ऑन डिलीवरी चुना था, इसलिए कुछ चार्ज नहीं हुआ और रिफ़ंड की ज़रूरत नहीं है।",
  },
  refundNone: {
    en: "This order has no refund on record. If you paid online and it was cancelled, the refund is started automatically; please talk to an agent if it doesn't show up within a day.",
    te: "ఈ ఆర్డర్‌కు వాపసు నమోదు కాలేదు. ఆన్‌లైన్‌లో చెల్లించి రద్దయితే వాపసు ఆటోమేటిక్‌గా మొదలవుతుంది; ఒక రోజులో కనబడకపోతే ఏజెంట్‌తో మాట్లాడండి.",
    hi: "इस ऑर्डर का कोई रिफ़ंड दर्ज नहीं है। ऑनलाइन भुगतान करके ऑर्डर रद्द हुआ हो तो रिफ़ंड अपने आप शुरू हो जाता है; एक दिन में न दिखे तो एजेंट से बात करें।",
  },
  refundPending: {
    en: "Your refund of ₹{amount} was started{since} and is being processed. Online refunds usually reach your account in 5–7 working days.",
    te: "మీ ₹{amount} వాపసు{since} ప్రారంభమైంది, ప్రాసెస్ అవుతోంది. ఆన్‌లైన్ వాపసు సాధారణంగా 5–7 పని దినాల్లో మీ ఖాతాకు చేరుతుంది.",
    hi: "आपका ₹{amount} का रिफ़ंड{since} शुरू हो गया है और प्रोसेस हो रहा है। ऑनलाइन रिफ़ंड आमतौर पर 5–7 कार्य दिवसों में आपके खाते में पहुँचता है।",
  },
  refundProcessed: {
    en: "Your refund of ₹{amount} was completed{since}. If your bank hasn't shown it yet, it can take a few more working days.",
    te: "మీ ₹{amount} వాపసు పూర్తయింది{since}. మీ బ్యాంక్‌లో ఇంకా కనబడకపోతే మరికొన్ని పని దినాలు పట్టవచ్చు.",
    hi: "आपका ₹{amount} का रिफ़ंड पूरा हो गया{since}। अगर आपके बैंक में अभी नहीं दिखा, तो कुछ और कार्य दिवस लग सकते हैं।",
  },
  refundFailed: {
    en: "Your refund of ₹{amount} could not be completed automatically. Please talk to an agent; we will send it manually.",
    te: "మీ ₹{amount} వాపసు ఆటోమేటిక్‌గా పూర్తి కాలేదు. దయచేసి ఏజెంట్‌తో మాట్లాడండి; మేము మానవీయంగా పంపిస్తాము.",
    hi: "आपका ₹{amount} का रिफ़ंड अपने आप पूरा नहीं हो सका। कृपया एजेंट से बात करें; हम इसे मैन्युअल रूप से भेज देंगे।",
  },
  since: {
    en: " on {date}",
    te: " {date} న",
    hi: " {date} को",
  },
  topupRefundNone: {
    en: "We don't see any extra amount added to #{ref}, so there is no top-up refund.",
    te: "#{ref} కి అదనపు మొత్తం జోడించినట్లు కనబడలేదు, కాబట్టి టాప్-అప్ వాపసు లేదు.",
    hi: "#{ref} में कोई अतिरिक्त राशि जुड़ी नहीं दिखती, इसलिए टॉप-अप रिफ़ंड नहीं है।",
  },
  topupRefundLine: {
    en: "Extra ₹{amount} you added to #{ref}: refund {state}.",
    te: "#{ref} కి మీరు జోడించిన అదనపు ₹{amount}: వాపసు {state}.",
    hi: "#{ref} में आपके जोड़े गए अतिरिक्त ₹{amount}: रिफ़ंड {state}।",
  },
  stateProcessed: { en: "completed", te: "పూర్తయింది", hi: "पूरा हुआ" },
  statePending: { en: "in progress", te: "ప్రక్రియలో ఉంది", hi: "प्रक्रिया में है" },
  stateFailed: { en: "failed, talk to an agent", te: "విఫలమైంది, ఏజెంట్‌తో మాట్లాడండి", hi: "विफल रहा, एजेंट से बात करें" },
  stateNotRefunded: {
    en: "not needed, the order wasn't cancelled",
    te: "అవసరం లేదు, ఆర్డర్ రద్దు కాలేదు",
    hi: "ज़रूरी नहीं, ऑर्डर रद्द नहीं हुआ",
  },

  // ---- driver assignment -------------------------------------------------------------------
  daNotNeeded: {
    en: "#{ref} doesn't need a driver any more (status: {status}).",
    te: "#{ref} కి ఇకపై డ్రైవర్ అవసరం లేదు (స్థితి: {status}).",
    hi: "#{ref} को अब ड्राइवर की ज़रूरत नहीं है (स्थिति: {status})।",
  },
  daSearching: {
    en: "We have been searching for a driver for #{ref} for {minutes} min{attempts}. Drivers nearby are being asked one after another. Try raising the price if your order allows it, or wait a little longer.",
    te: "#{ref} కోసం {minutes} నిమిషాలుగా డ్రైవర్ కోసం వెతుకుతున్నాము{attempts}. సమీపంలోని డ్రైవర్లను ఒకరి తర్వాత ఒకరిని అడుగుతున్నాము. వీలైతే ధర పెంచండి లేదా కొంచెం వేచి ఉండండి.",
    hi: "#{ref} के लिए {minutes} मिनट से ड्राइवर ढूँढ रहे हैं{attempts}। आस-पास के ड्राइवरों से एक-एक करके पूछा जा रहा है। संभव हो तो कीमत बढ़ाएँ, या थोड़ा और इंतज़ार करें।",
  },
  daAttempts: {
    en: " ({count} drivers asked so far)",
    te: " (ఇప్పటివరకు {count} డ్రైవర్లను అడిగాము)",
    hi: " (अब तक {count} ड्राइवरों से पूछा गया)",
  },
  daAssigned: {
    en: "{driver} is assigned to #{ref}.",
    te: "#{ref} కి {driver} నియమించబడ్డారు.",
    hi: "#{ref} के लिए {driver} असाइन हैं।",
  },
  daExhausted: {
    en: "No driver accepted #{ref} nearby. The search ends and the order is cancelled automatically (and refunded if you paid online). You can book again, or talk to an agent.",
    te: "#{ref} ని సమీపంలో ఏ డ్రైవర్ అంగీకరించలేదు. శోధన ముగిసి ఆర్డర్ ఆటోమేటిక్‌గా రద్దవుతుంది (ఆన్‌లైన్‌లో చెల్లిస్తే వాపసు). మళ్లీ బుక్ చేయవచ్చు లేదా ఏజెంట్‌తో మాట్లాడవచ్చు.",
    hi: "आस-पास किसी ड्राइवर ने #{ref} स्वीकार नहीं किया। खोज खत्म होकर ऑर्डर अपने आप रद्द हो जाएगा (ऑनलाइन भुगतान पर रिफ़ंड)। आप दोबारा बुक कर सकते हैं या एजेंट से बात करें।",
  },

  // ---- payments ----------------------------------------------------------------------------
  payFlagged: {
    en: "A payment of ₹{amount} on your account is being reviewed because the amount or order didn't match. If it was charged and no order was placed, it is refunded after review. Please talk to an agent if it takes more than a day.",
    te: "మీ ఖాతాలో ₹{amount} చెల్లింపు మొత్తం/ఆర్డర్ సరిపోలకపోవడంతో సమీక్షలో ఉంది. ఛార్జ్ అయి ఆర్డర్ కాకపోతే సమీక్ష తర్వాత వాపసు అవుతుంది. ఒక రోజు కంటే ఎక్కువ పడితే ఏజెంట్‌తో మాట్లాడండి.",
    hi: "आपके खाते पर ₹{amount} का भुगतान समीक्षा में है क्योंकि राशि या ऑर्डर मेल नहीं खाया। अगर पैसे कटे हैं और ऑर्डर नहीं बना, तो समीक्षा के बाद रिफ़ंड हो जाएगा। एक दिन से ज़्यादा लगे तो एजेंट से बात करें।",
  },
  payStuck: {
    en: "A payment of ₹{amount} was started but not completed. If money left your account, the bank reverses it automatically in 5–7 working days. No order was placed for it.",
    te: "₹{amount} చెల్లింపు ప్రారంభమైంది కానీ పూర్తి కాలేదు. మీ ఖాతా నుండి డబ్బు కట్ అయితే 5–7 పని దినాల్లో బ్యాంక్ ఆటోమేటిక్‌గా తిరిగి ఇస్తుంది. దీనికి ఆర్డర్ ఇవ్వబడలేదు.",
    hi: "₹{amount} का भुगतान शुरू हुआ लेकिन पूरा नहीं हुआ। अगर आपके खाते से पैसे कटे हैं तो बैंक 5–7 कार्य दिवसों में अपने आप लौटा देता है। इसके लिए कोई ऑर्डर नहीं बना।",
  },
  payOk: {
    en: "We don't see any failed or pending payments on your account. If money was deducted, please talk to an agent with the time and amount and we will trace it.",
    te: "మీ ఖాతాలో విఫలమైన లేదా పెండింగ్ చెల్లింపులు కనబడలేదు. డబ్బు కట్ అయితే సమయం, మొత్తంతో ఏజెంట్‌తో మాట్లాడండి, మేము వెతుకుతాము.",
    hi: "आपके खाते पर कोई विफल या लंबित भुगतान नहीं दिखता। अगर पैसे कटे हैं तो समय और राशि के साथ एजेंट से बात करें, हम जाँच करेंगे।",
  },

  // ---- fare --------------------------------------------------------------------------------
  fare: {
    en: "Fare for #{ref}: base ₹{base} + distance ₹{distance} + time ₹{time}",
    te: "#{ref} కి ఛార్జ్: బేస్ ₹{base} + దూరం ₹{distance} + సమయం ₹{time}",
    hi: "#{ref} का किराया: बेस ₹{base} + दूरी ₹{distance} + समय ₹{time}",
  },
  fareSurge: {
    en: ", x{surge} surge (high demand)",
    te: ", x{surge} సర్జ్ (అధిక డిమాండ్)",
    hi: ", x{surge} सर्ज (ज़्यादा माँग)",
  },
  fareDiscount: {
    en: ", minus ₹{discount} discount",
    te: ", మైనస్ ₹{discount} డిస్కౌంట్",
    hi: ", घटाकर ₹{discount} छूट",
  },
  fareTotal: {
    en: ". Total: ₹{total}.",
    te: ". మొత్తం: ₹{total}.",
    hi: "। कुल: ₹{total}।",
  },

  // ---- scheduled ---------------------------------------------------------------------------
  schedNone: {
    en: "#{ref} is not a scheduled order. Open the tracking screen for its live status.",
    te: "#{ref} షెడ్యూల్డ్ ఆర్డర్ కాదు. లైవ్ స్థితి కోసం ట్రాకింగ్ స్క్రీన్ తెరవండి.",
    hi: "#{ref} शेड्यूल्ड ऑर्डर नहीं है। लाइव स्थिति के लिए ट्रैकिंग स्क्रीन खोलें।",
  },
  schedPending: {
    en: "#{ref} is scheduled for {when} and is waiting for the restaurant to confirm the time.",
    te: "#{ref} {when} కి షెడ్యూల్ చేయబడింది, రెస్టారెంట్ సమయాన్ని ధృవీకరించడం కోసం వేచి ఉంది.",
    hi: "#{ref} {when} के लिए शेड्यूल है और रेस्टोरेंट के समय की पुष्टि का इंतज़ार है।",
  },
  schedAccepted: {
    en: "#{ref} is confirmed for {when}.",
    te: "#{ref} {when} కి నిర్ధారించబడింది.",
    hi: "#{ref} {when} के लिए पक्का है।",
  },
  schedRejected: {
    en: "The restaurant couldn't take #{ref} for {when}{reason}. Please schedule again for another time.",
    te: "{when} కి #{ref} ని రెస్టారెంట్ తీసుకోలేకపోయింది{reason}. దయచేసి మరో సమయానికి మళ్లీ షెడ్యూల్ చేయండి.",
    hi: "रेस्टोरेंट {when} के लिए #{ref} नहीं ले सका{reason}। कृपया किसी और समय के लिए दोबारा शेड्यूल करें।",
  },
  schedReason: { en: " ({reason})", te: " ({reason})", hi: " ({reason})" },

  // ---- helper task (never includes the start OTP / completion PIN) -------------------------
  helperSearching: {
    en: "We are looking for a helper for task #{ref}. If nobody accepts within the search time, the task is cancelled and refunded. You can raise the price to attract helpers.",
    te: "టాస్క్ #{ref} కోసం హెల్పర్ కోసం వెతుకుతున్నాము. శోధన సమయంలో ఎవరూ అంగీకరించకపోతే టాస్క్ రద్దయి వాపసు అవుతుంది. హెల్పర్లను ఆకర్షించడానికి ధర పెంచవచ్చు.",
    hi: "टास्क #{ref} के लिए हेल्पर ढूँढ रहे हैं। खोज के समय में कोई स्वीकार न करे तो टास्क रद्द होकर रिफ़ंड हो जाता है। हेल्पर आकर्षित करने के लिए कीमत बढ़ा सकते हैं।",
  },
  helperAssigned: {
    en: "{driver} accepted task #{ref}. Confirm in chat when you're ready; the task starts after you give them your start code in person.",
    te: "టాస్క్ #{ref} ని {driver} అంగీకరించారు. సిద్ధంగా ఉన్నప్పుడు చాట్‌లో నిర్ధారించండి; మీరు నేరుగా స్టార్ట్ కోడ్ ఇచ్చాక టాస్క్ మొదలవుతుంది.",
    hi: "टास्क #{ref} को {driver} ने स्वीकार कर लिया। तैयार होने पर चैट में पुष्टि करें; आप उन्हें सामने स्टार्ट कोड बताएँगे तभी टास्क शुरू होगा।",
  },
  helperStarted: {
    en: "Task #{ref} is in progress with {driver}. When it is done, you give them the completion PIN in person to finish it.",
    te: "టాస్క్ #{ref} {driver} తో కొనసాగుతోంది. పూర్తయ్యాక పూర్తి చేయడానికి మీరు కంప్లీషన్ పిన్ నేరుగా ఇవ్వండి.",
    hi: "टास्क #{ref} {driver} के साथ जारी है। पूरा होने पर इसे खत्म करने के लिए आप उन्हें कंप्लीशन पिन सामने बताएँगे।",
  },
  helperPriceHelp: {
    en: "A task's price comes from the base fare plus hourly time and distance beyond the free distance, plus platform fee and tax. Raising the price while searching adds to it.",
    te: "టాస్క్ ధర బేస్ ఫేర్ + గంటల సమయం + ఉచిత దూరం దాటిన దూరం + ప్లాట్‌ఫామ్ ఫీజు + పన్ను ఆధారంగా ఉంటుంది. శోధన సమయంలో ధర పెంచితే అది కలుస్తుంది.",
    hi: "टास्क की कीमत बेस फ़ेयर + घंटों का समय + मुफ़्त दूरी से ऊपर की दूरी + प्लेटफ़ॉर्म फ़ीस + टैक्स से बनती है। खोज के दौरान कीमत बढ़ाने पर वह जुड़ जाती है।",
  },

  // ---- fallbacks ---------------------------------------------------------------------------
  emptyStatic: {
    en: "We don't have an automatic answer for this yet. Please talk to an agent.",
    te: "దీనికి ఇంకా ఆటోమేటిక్ సమాధానం లేదు. దయచేసి ఏజెంట్‌తో మాట్లాడండి.",
    hi: "इसका अभी कोई स्वचालित उत्तर नहीं है। कृपया एजेंट से बात करें।",
  },
  failed: {
    en: "Sorry, we couldn't fetch this right now. Please try again or talk to an agent.",
    te: "క్షమించండి, ఇప్పుడు దీన్ని తీసుకురాలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి లేదా ఏజెంట్‌తో మాట్లాడండి.",
    hi: "क्षमा करें, अभी यह जानकारी नहीं मिल सकी। कृपया दोबारा कोशिश करें या एजेंट से बात करें।",
  },
};

export const CATEGORY_LABELS: Record<string, Template> = {
  ride: { en: "ride", te: "రైడ్", hi: "राइड" },
  food: { en: "food", te: "ఫుడ్", hi: "फ़ूड" },
  meat: { en: "meat", te: "మాంసం", hi: "मीट" },
  package: { en: "package delivery", te: "ప్యాకేజీ డెలివరీ", hi: "पैकेज डिलीवरी" },
  helper: { en: "helper task", te: "హెల్పర్ టాస్క్", hi: "हेल्पर टास्क" },
  payment: { en: "", te: "", hi: "" },
  general: { en: "", te: "", hi: "" },
};

export function normalizeLang(lang: unknown): SupportBotLang {
  return lang === "te" || lang === "hi" ? lang : "en";
}

function fill(template: string, params: AnswerParams = {}): string {
  return template.replace(/\{(\w+)\}/g, (_m, name) => {
    const value = params[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

/**
 * Joins answer fragments into one plain-text answer. A param that names another template
 * ("sub:<key>") is rendered first, which is how optional pieces (prep time, refund date) nest.
 */
export function renderAnswer(lang: SupportBotLang, parts: AnswerPart[]): string {
  const render = (part: AnswerPart): string => {
    if (part.key === "__static") return String(part.params?.text ?? "");
    const template = ANSWER_TEMPLATES[part.key];
    if (!template) return "";
    const params: AnswerParams = {};
    for (const [name, value] of Object.entries(part.params || {})) {
      params[name] = typeof value === "string" && value.startsWith("sub:") ? subRender(lang, value.slice(4)) : value;
    }
    return fill(template[lang] || template.en, params);
  };
  return parts
    .map(render)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+([.,])/g, "$1")
    .replace(/([.।]) +\./g, "$1")
    .trim();
}

// "sub:" + JSON {key, params} — a nested fragment with its own params.
function subRender(lang: SupportBotLang, spec: string): string {
  let parsed: { key: string; params?: AnswerParams };
  try {
    parsed = JSON.parse(spec);
  } catch {
    return "";
  }
  const template = ANSWER_TEMPLATES[parsed.key];
  return template ? fill(template[lang] || template.en, parsed.params) : "";
}

/** Builds the "sub:" spec for an optional nested fragment. */
export function sub(key: string, params: AnswerParams = {}): string {
  return "sub:" + JSON.stringify({ key, params });
}
