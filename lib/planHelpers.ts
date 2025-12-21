export const getPlanTier = (priceId: string | null | undefined): "free" | "light" | "standard" => {
  if (!priceId) return "free";

  // NEXT_PUBLIC_ 付きの変数を読むように変更
  const lightMonthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT_MONTHLY;
  const lightYearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT_YEARLY;
  const standardMonthly = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_MONTHLY;
  const standardYearly = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD_YEARLY;

  const lightIds = [lightMonthly, lightYearly].filter(Boolean);
  const standardIds = [standardMonthly, standardYearly].filter(Boolean);

  if (standardIds.includes(priceId)) return "standard";
  if (lightIds.includes(priceId)) return "light";
  
  return "free";
};

export const canAccessFeature = (currentTier: string, requiredTier: "light" | "standard") => {
  const levels: Record<string, number> = { free: 0, light: 1, standard: 2 };
  const currentLevel = levels[currentTier] ?? 0;
  const requiredLevel = levels[requiredTier] ?? 0;
  return currentLevel >= requiredLevel;
};

