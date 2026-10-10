export function todayISO() {
  return new Date().toLocaleDateString("en-CA") // YYYY-MM-DD in local time
}

// Inclusive: Jun 1 to Jun 1 is 1 day, Jun 1 to Jun 3 is 3 days
export function countDays(startDate, endDate) {
  const start = Date.parse(`${startDate}T00:00:00Z`)
  const end = Date.parse(`${endDate}T00:00:00Z`)
  return Math.round((end - start) / 86400000) + 1
}

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  })
}

export function validateDates(start, end) {
  if (!start || !end) return "Please choose a start and end date."
  if (start < todayISO()) return "Start date can't be in the past."
  if (end < start) return "End date must be on or after the start date."
  if (countDays(start, end) > 90) return "Rentals can be at most 90 days."
  return null
}

export function hasEnded(rental) {
  return rental.endDate < todayISO()
}