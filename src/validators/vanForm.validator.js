export const VAN_TYPES = ["simple", "rugged", "luxury"]

export function readVanFields(formData) {
  return {
    name: formData.get("name")?.trim(),
    price: Number(formData.get("price")),
    type: formData.get("type"),
    description: formData.get("description")?.trim(),
  }
}

export function validateVanFields({ name, price, type, description }) {
  if (!name) return "Please enter a name."
  if (!Number.isFinite(price) || price <= 0) return "Price must be greater than 0."
  if (!VAN_TYPES.includes(type)) return "Please choose a category."
  if (!description) return "Please add a description."
  return null
}