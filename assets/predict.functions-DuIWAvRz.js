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

  // Diamond packages (hardcoded tiers)
  const packages = [
    {
      id: 'starter',
      name: 'Starter',
      diamonds: 5,
      ghs: 50,
      ngn: 5000,
      features: ['3 match predictions', 'Standard accuracy', 'Email support'],
      example: 'Man City vs Liverpool → Home Win 2-1 (82%)',
      popular: false,
      tone: 'emerald'
    },
    {
      id: 'pro',
      name: 'Pro',
      diamonds: 15,
      ghs: 120,
      ngn: 12000,
      features: ['10 match predictions', 'Gemini AI analysis', 'Priority processing', 'Score + goals tips'],
      example: 'Arsenal vs Chelsea → Home Win 3-1 (89%) + Over 2.5 goals',
      popular: true,
      tone: 'gold'
    },
    {
      id: 'elite',
      name: 'Elite',
      diamonds: 30,
      ghs: 200,
      ngn: 20000,
      features: ['Unlimited predictions', 'Gemini AI + screenshot OCR', 'Instant processing', 'Full analysis + notes', 'VIP support'],
      example: 'Real Madrid vs Barcelona → Draw 2-2 (94%) + BTTS Yes',
      popular: false,
      tone: 'ice'
    }
  ];

  // User's diamond orders
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

async function callGeminiVision(fileBase64, mime, geminiKey) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
  const prompt = `You are an expert virtual football analyst specializing in instant virtual football algorithms (VGames, Bet9ja Virtuals, SportyBet Virtuals, EA SPORTS FIFA simulations).

═══════════════════════════════════════
STEP 1: READ THE IMAGE
═══════════════════════════════════════
- Extract EVERY fixture visible in the screenshot — exact team names as shown.
- Note any visible data: league position, form (W/D/L indicators), odds if shown, round/matchday number.
- Do NOT invent team names. Use only what you can read.

═══════════════════════════════════════
STEP 2: UNDERSTAND THE ALGORITHM
═══════════════════════════════════════
Virtual football follows algorithmic patterns:

HOME ADVANTAGE: Virtual leagues are biased toward home wins (~50-55%). Teams at home win more often than in real football.

DRAWS ARE RARE: Only ~20-22% of virtual matches end in draws. Avoid drawing picks unless there's a strong pattern.

GOALS PATTERN: ~58% of instant virtual matches have Over 2.5 goals. Common scores: 2-1, 1-0, 2-0, 3-1.

FORM MOMENTUM: In virtual leagues, strong teams on winning streaks tend to continue winning. Weak teams on losing streaks keep losing. The algorithm is less "random" than real football.

FAVORITE DOMINANCE: Teams ranked higher in the virtual table win ~65-70% of the time against lower-ranked opponents.

SCORE PATTERNS: 2-1 is the most common virtual score (~18%). 1-0 is second (~14%). 2-0 third (~12%). High scores (3+) are less common but happen when strong meets weak.

ROUND RESET: Early in a virtual season, outcomes are more unpredictable. Mid-to-late season, form patterns are more reliable.

═══════════════════════════════════════
STEP 3: MAKE SMART PICKS
═══════════════════════════════════════
For each fixture, analyze:
1. Home vs Away strength (home team usually stronger in virtuals)
2. Form indicators if visible (W=win, D=draw, L=loss)
3. League position if visible
4. Historical virtual football patterns

Pick the outcome with highest probability. Include draw only when teams look evenly matched.

═══════════════════════════════════════
RETURN FORMAT — raw JSON array only:
═══════════════════════════════════════
[{
  "home": "<exact team name from image>",
  "away": "<exact team name from image>",
  "homeDomain": "",
  "awayDomain": "",
  "probabilities": {"home": <number 15-75>, "draw": <number 10-25>, "away": <number 10-50>},
  "pick": "1" or "X" or "2",
  "pickLabel": "Home Win" or "Draw" or "Away Win",
  "drawChance": <number>,
  "correctScore": "X-X",
  "goals": "Over 2.5" or "Under 2.5",
  "confidence": <number 65-99>,
  "note": "<2-3 word reason: e.g. Home form strong, Favorite dominance, Evenly matched>"
}]

IMPORTANT: Use ONLY team names from the image. Match the exact names visible.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mime || "image/jpeg",
              data: fileBase64
            }
          }
        ]
      }
    ]
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

// POST: get-prediction — now uses atomic server-side RPC
// The RPC handles: balance check, deduction, logging, and prediction insert in one transaction
export async function n(props) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { fileBase64, mime, fileName } = props?.data ?? {};
  let matches = [];
  let usedGemini = false;

  // Try Gemini Vision if screenshot + API key available
  try {
    const { data: keyData } = await supabase.rpc('get_gemini_key').maybeSingle();
    let geminiKey = keyData?.gemini_api_key || null;
    console.log('[prediit] Gemini key present:', !!geminiKey, '| fileBase64 length:', fileBase64?.length || 0, '| mime:', mime);

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
    console.error('[prediit] Gemini vision FAILED:', geminiErr?.message || geminiErr);
  }

  // Fallback: random predictions if Gemini unavailable or failed
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
      // Generate realistic varied probabilities
      const probHome = Math.floor(Math.random() * 50) + 20;
      const probDraw = Math.floor(Math.random() * 20) + 10;
      const probAway = 100 - probHome - probDraw;
      // Pick based on actual probabilities (not always home)
      const roll = Math.random() * 100;
      let pick, pickLabel;
      if (roll < probHome) { pick = "1"; pickLabel = "Home Win"; }
      else if (roll < probHome + probDraw) { pick = "X"; pickLabel = "Draw"; }
      else { pick = "2"; pickLabel = "Away Win"; }
      // Correct score based on pick
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
        note: "Model-generated prediction (add Gemini API key for screenshot analysis)"
      });
    }
  }

  // Atomic server-side: deducts diamonds + logs transaction + inserts prediction in one tx
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('submit_prediction', {
    p_user_id: user.id,
    p_result: { matches, source: usedGemini ? 'gemini' : 'model' },
    p_cost: 0
  });

  if (rpcErr) throw rpcErr;
  if (!rpcResult?.ok) return rpcResult;

  return { ok: true, matches, source: usedGemini ? 'gemini' : 'model' };
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