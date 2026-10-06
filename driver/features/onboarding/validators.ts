export const validateEmailFormat = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

export const validateAadhaarFormat = (num: string) => /^[2-9][0-9]{11}$/.test(num);

export const validatePANFormat = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

// Indian DL: 2 letters (state) + 2 digits (RTO) + 4 digits (year) + 7 digits (serial)
export const validateDLFormat = (dl: string): boolean => {
  const cleaned = dl.replace(/[\s-]/g, "").toUpperCase();
  return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(cleaned);
};
