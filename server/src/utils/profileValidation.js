const GENERIC_LOCATION_WORDS = new Set([
  "address",
  "home",
  "my address",
  "n/a",
  "na",
  "none",
  "unknown",
  "your address",
  "test",
]);

export function cleanText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeTitle(value) {
  return cleanText(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

export function validateNigerianPhone(value) {
  const phone = cleanText(value);
  const normalized = phone.replace(/[\s-]/g, "");
  const valid = /^(?:\+234|234|0)[789][01]\d{8}$/.test(normalized);

  return {
    valid,
    value: normalized.startsWith("234") ? `+${normalized}` : normalized,
    message: "Enter a valid Nigerian phone number.",
  };
}

export function validateUserLocation(location) {
  const area = normalizeTitle(location?.area);
  const city = normalizeTitle(location?.city);
  const state = normalizeTitle(location?.state);
  const fields = [
    ["area", area],
    ["city", city],
    ["state", state],
  ];

  for (const [field, value] of fields) {
    if (value.length < 2) {
      return {
        valid: false,
        message: `${field} must be at least 2 characters.`,
      };
    }
    if (GENERIC_LOCATION_WORDS.has(value.toLowerCase())) {
      return {
        valid: false,
        message: `${field} must be a real location, not a placeholder.`,
      };
    }
  }

  if (new Set([area.toLowerCase(), city.toLowerCase(), state.toLowerCase()]).size < 2) {
    return {
      valid: false,
      message: "Area, city, and state cannot all be the same.",
    };
  }

  return { valid: true, value: { area, city, state } };
}

export function validateDetailedAddress(value) {
  const address = cleanText(value);
  const parts = address.split(",").map((part) => cleanText(part)).filter(Boolean);

  if (address.length < 12) {
    return {
      valid: false,
      message: "Address must be more detailed.",
    };
  }

  if (parts.length < 2) {
    return {
      valid: false,
      message: "Address must include area and city/state, separated by commas.",
    };
  }

  if (GENERIC_LOCATION_WORDS.has(address.toLowerCase())) {
    return {
      valid: false,
      message: "Address must be a real location, not a placeholder.",
    };
  }

  return { valid: true, value: address };
}
