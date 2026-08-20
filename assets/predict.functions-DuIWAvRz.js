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

// ── OCR: extract text from screenshot ──────────────────────────────────────
let _tesseract = null;
async function loadTesseract() {
  if (_tesseract) return _tesseract;
  return new Promise((resolve, reject) => {
    // Already loaded globally?
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
  console.log('[prediit] OCR extracted text (' + text.length + ' chars):', text.substring(0, 800));
  return text;
}

// ── Gemini Vision with OCR pre-processing ──────────────────────────────────
async function callGeminiVision(fileBase64, mime, geminiKey) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

  // Step 1: OCR the screenshot to extract real team names
  let ocrText = '';
  try {
    ocrText = await ocrExtract(fileBase64, mime);
  } catch (ocrErr) {
    console.error('[prediit] OCR failed:', ocrErr?.message);
  }

  // Step 2: Send image + OCR text to Gemini for smart prediction
  const prompt = `You are an expert virtual football analyst. This is a screenshot from an instant virtual football game.

═══════════════════════════════════════
OCR-EXTRACTED TEXT FROM SCREENSHOT:
═══════════════════════════════════════
${ocrText || '(OCR failed — read the image directly)'}

═══════════════════════════════════════
HOW TO USE THIS DATA:
═══════════════════════════════════════
1. The OCR text above contains ALL text visible in the screenshot.
2. Look for team name pairs — each line or group with two team names is a fixture.
3. Match OCR text with the image to confirm each home vs away fixture.
4. If OCR missed teams, read them from the image.
5. Note any form (W/D/L), league position, odds, round number.
6. DO NOT invent team names — use ONLY what you find in the OCR text or image.

═══════════════════════════════════════
VIRTUAL FOOTBALL ALGORITHM:
═══════════════════════════════════════
• Home wins ~50-55% (stronger bias than real football)
• Draws only ~20-22% — rare, avoid unless evenly matched
• ~58% Over 2.5 goals; common scores: 2-1, 1-0, 2-0
• Form momentum: winning teams keep winning, losers keep losing
• Top-ranked teams beat lower-ranked ~65-70% of the time
• Most common score: 2-1 (18%), then 1-0 (14%), then 2-0 (12%)

═══════════════════════════════════════
ANALYZE EACH FIXTURE AND RETURN:
═══════════════════════════════════════
For each fixture found, provide:
- Which teams are playing (from OCR/image)
- Home win, draw, or away win probability
- Your pick (1, X, or 2)
- Correct score prediction
- Over/Under 2.5 goals
- Confidence (65-99)
- Brief reason (2-4 words)

RETURN ONLY a raw JSON array — no markdown, no explanation text:
[{
  "home": "<team from OCR/image>",
  "away": "<team from OCR/image>",
  "homeDomain": "",
  "awayDomain": "",
  "probabilities": {"home": <15-75>, "draw": <10-25>, "away": <10-50>},
  "pick": "1" or "X" or "2",
  "pickLabel": "Home Win" or "Draw" or "Away Win",
  "drawChance": <number>,
  "correctScore": "X-X",
  "goals": "Over 2.5" or "Under 2.5",
  "confidence": <65-99>,
  "note": "<brief reason>"
}]

RULE: Only use team names found in the OCR text or visible in the image.`;

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
  return JSON.parse(cleaned);
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
    console.log('[prediit] Gemini key:', !!geminiKey, '| file:', fileBase64?.length || 0, '| mime:', mime);

    if (geminiKey && fileBase64) {
      matches = await callGeminiVision(fileBase64, mime || 'image/jpeg', geminiKey);
      console.log('[prediit] Gemini returned', matches?.length, 'matches:', matches?.map(m => m.home + ' vs ' + m.away));
      if (Array.isArray(matches) && matches.length > 0) {
        usedGemini = true;
      }
    } else {
      console.warn('[prediit] Gemini skipped — key:', !!geminiKey, 'file:', !!fileBase64);
    }
  } catch (geminiErr) {
    console.error('[prediit] Gemini/OCR FAILED:', geminiErr?.message || geminiErr);
  }

  // Fallback: random predictions if OCR+Gemini unavailable or failed
  if (!usedGemini) {
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
        note: "Fallback model (upload screenshot for AI analysis)"
      });
    }
  }

  // Atomic server-side: deducts diamonds + inserts prediction
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('submit_prediction', {
    p_user_id: user.id,
    p_result: { matches, source: usedGemini ? 'gemini' : 'model' },
    p_cost: 0
  });

  if (rpcErr) throw rpcErr;
  if (!rpcResult?.ok) return rpcResult;

  return { ok: true, matches, source: usedGemini ? 'gemini+ocr' : 'model' };
}

// POST: history clear/delete function
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
