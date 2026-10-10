const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadImage(file) {
  if (!file.type.startsWith("image/")) {
    throw { message: "Please choose an image file." }
  }
  if (file.size > MAX_SIZE) {
    throw { message: "Image must be smaller than 5MB." }
  }

  const body = new FormData()
  body.append("file", file)
  body.append("upload_preset", uploadPreset)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body }
  )
  if (!res.ok) throw { message: "Image upload failed. Please try again." }

  const data = await res.json()
  return data.secure_url
}