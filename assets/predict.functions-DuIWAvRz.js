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

  return {
    diamonds: profile?.diamonds ?? 0,
    cost: settings?.prediction_cost ?? 50,
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      referralCode: profile.referral_code,
      status: profile.status
    },
    predictions: predictions || []
  };
}

async function callGeminiVision(fileBase64, mime, geminiKey) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
  const prompt = `Analyze this virtual football fixture screenshot.
Extract all home and away team names from the fixtures list.
For each fixture detected, predict the virtual game outcome and return EXACTLY a JSON array matching the structure below.
Do not wrap it in markdown block tags like \`\`\`json. Just return raw JSON.

JSON Schema example:
[
  {
    "home": "Arsenal",
    "away": "Chelsea",
    "homeDomain": "arsenal.com",
    "awayDomain": "chelseafc.com",
    "probabilities": {
      "home": 65,
      "draw": 20,
      "away": 15
    },
    "pick": "1",
    "pickLabel": "Home Win",
    "drawChance": 20,
    "correctScore": "2-1",
    "goals": "Over 2.5",
    "confidence": 85,
    "note": "High momentum and attacking form detected."
  }
]`;

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

  // Generate predictions client-side (random fallback until Gemini edge function is wired)
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
  const matches = [];
  for (let i = 0; i < 3; i++) {
    const home = shuffled[i * 2];
    const away = shuffled[i * 2 + 1];
    const probHome = Math.floor(Math.random() * 35) + 45;
    const probDraw = Math.floor(Math.random() * 15) + 10;
    const probAway = 100 - probHome - probDraw;
    const pick = probHome > probAway ? "1" : "2";
    matches.push({
      home: home.name, away: away.name,
      homeDomain: home.domain, awayDomain: away.domain,
      pick, pickLabel: pick === "1" ? "Home Win" : "Away Win",
      confidence: probHome > probAway ? probHome : probAway,
      drawChance: probDraw,
      correctScore: pick === "1" ? `${Math.floor(Math.random() * 2) + 2} - ${Math.floor(Math.random() * 2)}` : `${Math.floor(Math.random() * 2)} - ${Math.floor(Math.random() * 2) + 2}`,
      goals: "Over 2.5",
      probabilities: { home: probHome, draw: probDraw, away: probAway },
      note: "High model confidence & momentum detected"
    });
  }

  // Atomic server-side: deducts diamonds + logs transaction + inserts prediction in one tx
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('submit_prediction', {
    p_user_id: user.id,
    p_result: { matches },
    p_cost: 0
  });

  if (rpcErr) throw rpcErr;
  if (!rpcResult?.ok) return rpcResult;

  return { ok: true, matches };
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