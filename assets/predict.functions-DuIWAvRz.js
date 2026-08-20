import { C as supabase } from "./index-sG8SpmM9.js";

// GET: prediction-home
export async function t() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: settings } = await supabase
    .from('settings')
    .select('prediction_cost')
    .eq('id', 'global_config')
    .maybeSingle();

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const packages = [
    {
      id: 'starter', name: 'Starter', diamonds: 5, ghs: 50, ngn: 5000,
      features: ['3 match predictions', 'Standard accuracy', 'Email support'],
      example: 'Man City vs Liverpool → Home Win 2-1 (82%)',
      popular: false, tone: 'emerald'
    },
    {
      id: 'pro', name: 'Pro', diamonds: 15, ghs: 120, ngn: 12000,
      features: ['10 match predictions', 'Gemini AI analysis', 'Priority processing', 'Score + goals tips'],
      example: 'Arsenal vs Chelsea → Home Win 3-1 (89%) + Over 2.5 goals',
      popular: true, tone: 'gold'
    },
    {
      id: 'elite', name: 'Elite', diamonds: 30, ghs: 200, ngn: 20000,
      features: ['Unlimited predictions', 'Gemini AI + screenshot OCR', 'Instant processing', 'Full analysis + notes', 'VIP support'],
      example: 'Real Madrid vs Barcelona → Draw 2-2 (94%) + BTTS Yes',
      popular: false, tone: 'ice'
    }
  ];

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return {
    diamonds: profile?.diamonds ?? 0,
    cost: settings?.prediction_cost ?? 50,
    packages,
    orders: orders || [],
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      referralCode: profile.referral_code,
      status: profile.status,
      country: profile.country || null
    },
    predictions: predictions || []
  };
}

// ── OCR engine ─────────────────────────────────────────────────────────────
let _tesseract = null;
async function loadTesseract() {
  if (_tesseract) return _tesseract;
  return new Promise((resolve, reject) => {
    if (window.Tesseract) { _tesseract = window.Tesseract; resolve(_tesseract); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload = () => { _tesseract = window.Tesseract; resolve(_tesseract); };
    s.onerror = () => reject(new Error('Failed to load OCR engine'));
    document.head.appendChild(s);
  });
}

async function ocrExtract(fileBase64, mime) {
  const Tesseract = await loadTesseract();
  const byteChars = atob(fileBase64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime || 'image/png' });
  const url = URL.createObjectURL(blob);

  const result = await Tesseract.recognize(url, 'eng', {
    logger: m => { if (m.status === 'recognizing text') console.log('[prediit] OCR:', Math.round(m.progress * 100) + '%'); }
  });

  URL.revokeObjectURL(url);
  const text = result?.data?.text || '';
  console.log('[prediit] OCR raw (' + text.length + ' chars):', text);
  return text;
}

// ── Clean OCR: extract only team-like lines ────────────────────────────────
function cleanOcrText(raw) {
  // Split into lines, filter out junk
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  // Keep lines that have at least 2 words and contain letters (team names)
  const teamLines = lines.filter(l => {
    const letters = l.replace(/[^a-zA-Z]/g, '');
    return letters.length >= 4 && l.split(/\s+/).length >= 2;
  });
  const cleaned = teamLines.join('\n');
  console.log('[prediit] OCR cleaned (' + cleaned.length + ' chars):', cleaned);
  return cleaned || raw.substring(0, 1000);
}

// ── Gemini Vision with OCR pre-processing ──────────────────────────────────
async function callGeminiVision(fileBase64, mime, geminiKey) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

  // Step 1: OCR
  let ocrText = '';
  try {
    const raw = await ocrExtract(fileBase64, mime);
    ocrText = cleanOcrText(raw);
  } catch (ocrErr) {
    console.error('[prediit] OCR failed:', ocrErr?.message);
  }

  // Step 2: Gemini — OCR text is the PRIMARY input, image is secondary
  const prompt = `TASK: Predict outcomes for virtual football matches found in the OCR text below.

THESE ARE THE TEAMS FROM THE SCREENSHOT (extracted by OCR — these are REAL, not examples):
${ocrText || 'No text extracted — read the image instead'}

INSTRUCTIONS:
- The team names listed above are REAL teams from the user's screenshot.
- Match each pair as a fixture (first vs second, third vs fourth, etc.)
- Predict the outcome for EACH fixture using virtual football patterns
- Home wins ~50-55%, draws ~20-22%, Over 2.5 goals ~58%
- Top teams beat lower teams ~65-70%
- Most common score: 2-1 (18%), 1-0 (14%), 2-0 (12%)

OUTPUT: raw JSON array (one object per fixture from the OCR text above):
[{"home":"<team from OCR>","away":"<team from OCR>","homeDomain":"","awayDomain":"","probabilities":{"home":55,"draw":22,"away":23},"pick":"1","pickLabel":"Home Win","drawChance":22,"correctScore":"2-1","goals":"Over 2.5","confidence":78,"note":"Home advantage"}]

CRITICAL: Use ONLY the team names from the OCR text above. Do NOT use Chelsea, Arsenal, Liverpool, Man City, Real Madrid, Barcelona, Bayern, or PSG unless they appear in the OCR text.`;

  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType: mime || "image/jpeg", data: fileBase64 } }
      ]
    }]
  };

  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error("Gemini API error: " + errText);
  }

  const resJson = await response.json();
  const rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  console.log('[prediit] Gemini predicted:', parsed.map(m => m.home + ' vs ' + m.away));
  return parsed;
}

// POST: get-prediction — OCR + Gemini Vision → atomic server-side RPC
export async function n(props) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { fileBase64, mime, fileName } = props?.data ?? {};
  let matches = [];
  let usedGemini = false;

  try {
    const { data: keyData } = await supabase.rpc('get_gemini_key').maybeSingle();
    let geminiKey = keyData?.gemini_api_key || null;
    console.log('[prediit] Gemini key:', !!geminiKey, '| file:', fileBase64?.length || 0);

    if (geminiKey && fileBase64) {
      matches = await callGeminiVision(fileBase64, mime || 'image/jpeg', geminiKey);
      if (Array.isArray(matches) && matches.length > 0) usedGemini = true;
    } else {
      console.warn('[prediit] Gemini skipped — key:', !!geminiKey, 'file:', !!fileBase64);
    }
  } catch (err) {
    console.error('[prediit] Gemini/OCR FAILED:', err?.message || err);
  }

  // Fallback
  if (!usedGemini) {
    console.warn('[prediit] Using fallback model (no AI prediction)');
    const teams = [
      { name: "Arsenal", domain: "arsenal.com" },
      { name: "Chelsea", domain: "chelseafc.com" },
      { name: "Liverpool", domain: "liverpoolfc.com" },
      { name: "Man City", domain: "mancity.com" },
      { name: "Real Madrid", domain: "realmadrid.com" },
      { name: "Barcelona", domain: "fcbarcelona.com" },
      { name: "Bayern Munich", domain: "fcbayern.com" },
      { name: "PSG", domain: "psg.fr" }
    ];
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 3; i++) {
      const home = shuffled[i * 2];
      const away = shuffled[i * 2 + 1];
      const probHome = Math.floor(Math.random() * 50) + 20;
      const probDraw = Math.floor(Math.random() * 20) + 10;
      const probAway = 100 - probHome - probDraw;
      const roll = Math.random() * 100;
      let pick, pickLabel;
      if (roll < probHome) { pick = "1"; pickLabel = "Home Win"; }
      else if (roll < probHome + probDraw) { pick = "X"; pickLabel = "Draw"; }
      else { pick = "2"; pickLabel = "Away Win"; }
      let correctScore;
      if (pick === "1") correctScore = `${Math.floor(Math.random() * 3) + 1} - ${Math.floor(Math.random() * 2)}`;
      else if (pick === "X") correctScore = `${Math.floor(Math.random() * 2) + 1} - ${Math.floor(Math.random() * 2) + 1}`;
      else correctScore = `${Math.floor(Math.random() * 2)} - ${Math.floor(Math.random() * 3) + 1}`;
      matches.push({
        home: home.name, away: away.name,
        homeDomain: home.domain, awayDomain: away.domain,
        pick, pickLabel,
        confidence: Math.max(probHome, probDraw, probAway),
        drawChance: probDraw,
        correctScore,
        goals: Math.random() > 0.5 ? "Over 2.5" : "Under 2.5",
        probabilities: { home: probHome, draw: probDraw, away: probAway },
        note: "Fallback model — upload screenshot for AI analysis"
      });
    }
  }

  const { data: rpcResult, error: rpcErr } = await supabase.rpc('submit_prediction', {
    p_user_id: user.id,
    p_result: { matches, source: usedGemini ? 'gemini+ocr' : 'model' },
    p_cost: 0
  });

  if (rpcErr) throw rpcErr;
  if (!rpcResult?.ok) return rpcResult;

  return { ok: true, matches, source: usedGemini ? 'gemini+ocr' : 'model' };
}

// POST: history clear/delete
export async function r(props) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = props?.data?.id;

  if (id === 'all' || !id) {
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('user_id', user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
  }

  return { ok: true };
}
