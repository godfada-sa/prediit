import { C as supabase } from "./index-sG8SpmM9.js";

export async function t() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      payment: { ghana: null, nigeria: null },
      registration: { ghs: 50, ngn: 10000 }
    };
  }

  return {
    payment: {
      ghana: data.payment_ghana,
      nigeria: data.payment_nigeria
    },
    registration: {
      ghs: Number(data.registration_ghs),
      ngn: Number(data.registration_ngn)
    }
  };
}