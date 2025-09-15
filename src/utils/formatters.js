export const formatCurrency = (value) => {
  console.log('🔍 DEBUG - formatCurrency input:', value, 'Type:', typeof value);

  // Handle null, undefined, empty string
  if (value === null || value === undefined || value === "") {
    return "Rp 0";
  }

  // Handle both string and number values
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  console.log('🔍 DEBUG - formatCurrency parsed:', numValue);

  if (isNaN(numValue) || numValue < 0) {
    return "Rp 0";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numValue);

  console.log('🔍 DEBUG - formatCurrency result:', formatted);
  return formatted;
};
