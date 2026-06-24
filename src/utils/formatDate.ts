const uzMonths = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
]

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "—"

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  const day = String(date.getDate()).padStart(2, "0")
  const month = uzMonths[date.getMonth()]
  const year = date.getFullYear()
  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")

  return `${day}-${month} ${year}, ${hour}:${minute}`
}

export const formatDateOnly = (value?: string | Date | null) => {
  if (!value) return "—"

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  const day = String(date.getDate()).padStart(2, "0")
  const month = uzMonths[date.getMonth()]
  const year = date.getFullYear()

  return `${day}-${month} ${year}`
}
