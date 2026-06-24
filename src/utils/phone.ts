export const ensureUzPhonePrefix = (value?: string | null) => {
  if (!value) return "+998"

  const cleaned = value.replace(/[^\d+]/g, "")

  if (cleaned === "+" || cleaned === "+9" || cleaned === "+99") {
    return "+998"
  }

  if (cleaned.startsWith("+998")) {
    return cleaned
  }

  const digits = cleaned.replace(/\D/g, "")

  if (!digits) return "+998"

  if (digits.startsWith("998")) {
    return `+${digits}`
  }

  return `+998${digits}`
}

export const normalizeUzPhoneInput = ensureUzPhonePrefix

export const normalizeUzPhoneOnFocus = (value?: string | null) => {
  if (!value || value.trim() === "") return "+998"
  return value
}
