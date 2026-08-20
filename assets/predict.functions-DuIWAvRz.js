import { C as supabase } from "./index-sG8SpmM9.js";

// GET: prediction home
export async function t() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const [profileResult, settingsResult, predictionsResult, ordersResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("settings").select("prediction_cost").eq("id", "global_config").maybeSingle(),
    supabase.from("predictions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("orders").select("*").eq("user_id", user.id).eq("asset_type", "diamonds").order("created_at", { ascending: false }),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (settingsResult.error) throw settingsResult.error;
  if (predictionsResult.error) throw predictionsResult.error;
  if (ordersResult.error) throw ordersResult.error;

  const profile = profileResult.data;
  const packages = [
    {
      id: "starter", name: "Starter", diamonds: 5, ghs: 50, ngn: 5000,
      features: ["3 match predictions", "Standard processing", "Email support"],
      example: "Fixture analysis with ranked probabilistic picks",
      popular: false, tone: "emerald"
    },
    {
      id: "pro", name: "Pro", diamonds: 15, ghs: 120, ngn: 12000,
      features: ["10 match predictions", "AI screenshot analysis", "Priority processing", "Score and goals estimates"],
      example: "Ranked picks with confidence and goals estimates",
      popular: true, tone: "gold"
    },
    {
      id: "elite", name: "Elite", diamonds: 30, ghs: 200, ngn: 20000,
      features: ["30 prediction credits", "AI screenshot analysis", "Instant processing", "Full match notes", "Priority support"],
      example: "Full-slate analysis with transparent confidence estimates",
      popular: false, tone: "ice"
    }
  ];

  return {
    diamonds: profile?.diamonds ?? 0,
    cost: settingsResult.data?.prediction_cost ?? 50,
    packages,
    orders: ordersResult.data || [],
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      referralCode: profile.referral_code,
      status: profile.status,
      country: profile.country || null
    },
    predictions: predictionsResult.data || []
  };
}

// POST: the image and AI key stay on the server. The Edge Function invokes one
// atomic RPC only after a valid fixture result is available.
export async function n(props) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { fileBase64, mime, fileName } = props?.data ?? {};
  if (!fileBase64) throw new Error("Choose a screenshot first");

  const { data, error } = await supabase.functions.invoke("get-prediction", {
    body: { fileBase64, mime, fileName }
  });
  if (error) throw new Error(error.message || "Prediction request failed");
  return data;
}

// POST: history clear/delete
export async function r(props) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const id = props?.data?.id;
  let query = supabase.from("predictions").delete().eq("user_id", user.id);
  if (id && id !== "all") query = query.eq("id", id);
  const { error } = await query;
  if (error) throw error;
  return { ok: true };
}
