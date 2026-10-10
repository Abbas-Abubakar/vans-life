import { Link, redirect, useActionData } from "react-router-dom"
import VanForm from "../../components/VanForm"
import { addVan } from "../../api/vans.api"
import { uploadImage } from "../../utils/cloudinary"
import { requireAuth } from "../../utils/requireAuth"
import { readVanFields, validateVanFields } from "../../validators/vanForm.validator"

export async function loader({ request }) {
  await requireAuth({ request })
  return null
}

export async function action({ request }) {
  await requireAuth({ request })
  const formData = await request.formData()
  const fields = readVanFields(formData)

  const error = validateVanFields(fields)
  if (error) return error

  const file = formData.get("image")
  if (!file || !file.size) return "Please choose a photo."

  try {
    const imageUrl = await uploadImage(file)
    await addVan({ ...fields, imageUrl })
  } catch (err) {
    return err.message || "Could not add your van."
  }

  return redirect("/host/vans")
}

export default function AddVan() {
  const errorMessage = useActionData()
  return (
    <section>
      <Link to=".." relative="path" className="back-button">&larr; <span>Back to all vans</span></Link>
      <h1 className="host-vans-title">Add a van</h1>
      <VanForm errorMessage={errorMessage} submitLabel="Add van" submittingLabel="Adding..." />
    </section>
  )
}