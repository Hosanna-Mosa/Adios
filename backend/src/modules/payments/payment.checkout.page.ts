// Server-rendered pages for the browser checkout (the app opens them in a Chrome Custom Tab /
// SFSafariViewController). Server-sent text is localized in en/te/hi (plan §6.18).

type Lang = "en" | "te" | "hi";

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    title: "Flavour payment",
    pay: "Pay",
    opening: "Opening secure payment…",
    success: "Payment successful",
    successHint: "Returning you to the Flavour app.",
    failed: "Payment failed",
    failedHint: "No money was taken for this attempt. Go back to the app to try again.",
    cancelled: "Payment cancelled",
    expired: "This payment link has expired. Go back to the app and tap Pay again.",
    returnToApp: "Return to Flavour",
  },
  te: {
    title: "Flavour చెల్లింపు",
    pay: "చెల్లించండి",
    opening: "సురక్షిత చెల్లింపు తెరుస్తోంది…",
    success: "చెల్లింపు విజయవంతమైంది",
    successHint: "మిమ్మల్ని Flavour యాప్‌కు తిరిగి పంపుతున్నాం.",
    failed: "చెల్లింపు విఫలమైంది",
    failedHint: "ఈ ప్రయత్నానికి డబ్బు తీసుకోలేదు. మళ్లీ ప్రయత్నించడానికి యాప్‌కు తిరిగి వెళ్లండి.",
    cancelled: "చెల్లింపు రద్దు చేయబడింది",
    expired: "ఈ చెల్లింపు లింక్ గడువు ముగిసింది. యాప్‌కు తిరిగి వెళ్లి మళ్లీ చెల్లించండి నొక్కండి.",
    returnToApp: "Flavour కు తిరిగి వెళ్లండి",
  },
  hi: {
    title: "Flavour भुगतान",
    pay: "भुगतान करें",
    opening: "सुरक्षित भुगतान खुल रहा है…",
    success: "भुगतान सफल रहा",
    successHint: "आपको Flavour ऐप पर वापस ले जा रहे हैं।",
    failed: "भुगतान विफल रहा",
    failedHint: "इस प्रयास के लिए कोई पैसा नहीं कटा। दोबारा कोशिश करने के लिए ऐप पर वापस जाएँ।",
    cancelled: "भुगतान रद्द किया गया",
    expired: "यह भुगतान लिंक समाप्त हो गया है। ऐप पर वापस जाएँ और फिर से भुगतान करें दबाएँ।",
    returnToApp: "Flavour पर वापस जाएँ",
  },
};

const pickLang = (lang?: string): Lang => (lang === "te" || lang === "hi" ? lang : "en");

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// JSON inside a <script> block: escape "<" so a value can never close the tag.
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

const shell = (lang: Lang, body: string, script = "") => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(STRINGS[lang].title)}</title>
<style>
  :root { color-scheme: light dark; --bg:#f7f7f8; --card:#fff; --text:#111; --sec:#555; --accent:#0EA5E9; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0f1115; --card:#181b21; --text:#f2f2f2; --sec:#a3a3a3; } }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:16px;
         font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Telugu", "Noto Sans Devanagari", sans-serif;
         background:var(--bg); color:var(--text); }
  .card { width:100%; max-width:420px; background:var(--card); border-radius:18px; padding:28px 20px; text-align:center;
          box-shadow:0 4px 24px rgba(0,0,0,.08); }
  h1 { font-size:20px; margin:0 0 8px; }
  p { color:var(--sec); margin:0 0 20px; line-height:1.45; }
  .amount { font-size:30px; font-weight:700; margin:4px 0 20px; color:var(--text); }
  .btn { display:block; width:100%; border:0; border-radius:14px; padding:15px; font-size:16px; font-weight:700;
         background:var(--accent); color:#fff; text-decoration:none; cursor:pointer; }
  .btn.secondary { background:transparent; color:var(--accent); margin-top:10px; }
</style>
</head>
<body><main class="card">${body}</main>${script}</body>
</html>`;

export function renderCheckoutPage(opts: {
  language?: string;
  amountPaise: number;
  checkoutOptions: Record<string, unknown>;
  callbackUrl: string;
  cancelUrl: string;
}) {
  const lang = pickLang(opts.language);
  const s = STRINGS[lang];
  const rupees = (opts.amountPaise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });

  const body = `
    <h1>${escapeHtml(s.title)}</h1>
    <p id="status">${escapeHtml(s.opening)}</p>
    <div class="amount">${escapeHtml(rupees)}</div>
    <button class="btn" id="pay" type="button">${escapeHtml(s.pay)} ${escapeHtml(rupees)}</button>
    <a class="btn secondary" href="${escapeHtml(opts.cancelUrl)}">${escapeHtml(s.returnToApp)}</a>`;

  // redirect:true makes Razorpay POST the result to callback_url, so the server — not this page —
  // decides what happened. That also works when a UPI app switch reloads the tab.
  const script = `
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  (function () {
    var options = ${scriptJson(opts.checkoutOptions)};
    options.callback_url = ${scriptJson(opts.callbackUrl)};
    options.redirect = true;
    options.modal = { ondismiss: function () { document.getElementById("status").textContent = ${scriptJson(s.cancelled)}; } };
    function openCheckout() { new Razorpay(options).open(); }
    document.getElementById("pay").addEventListener("click", openCheckout);
    if (window.Razorpay) { openCheckout(); }
  })();
</script>`;

  return shell(lang, body, script);
}

export function renderResultPage(opts: { language?: string; outcome: "success" | "failed" | "expired"; returnUrl?: string }) {
  const lang = pickLang(opts.language);
  const s = STRINGS[lang];
  const heading = opts.outcome === "success" ? s.success : opts.outcome === "failed" ? s.failed : s.title;
  const hint = opts.outcome === "success" ? s.successHint : opts.outcome === "failed" ? s.failedHint : s.expired;

  const button = opts.returnUrl
    ? `<a class="btn" id="back" href="${escapeHtml(opts.returnUrl)}">${escapeHtml(s.returnToApp)}</a>`
    : "";
  // Chrome may block an automatic jump into the app without a tap, so the button stays as the fallback.
  const script = opts.returnUrl
    ? `<script>setTimeout(function () { window.location.replace(${scriptJson(opts.returnUrl)}); }, 300);</script>`
    : "";

  return shell(lang, `<h1>${escapeHtml(heading)}</h1><p>${escapeHtml(hint)}</p>${button}`, script);
}
