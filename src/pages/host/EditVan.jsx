import { Link, redirect, useActionData, useLoaderData } from "react-router-dom"
import VanForm from "../../components/VanForm"
import { getHostVans, updateVan } from "../../api/vans.api"
import { uploadImage } from "../../utils/cloudinary"
import { requireAuth } from "../../utils/requireAuth"
import { readVanFields, validateVanFields } from "../../validators/vanForm.validator"

export async function loader({ request, params }) {
  await requireAuth({ request })
  return getHostVans(params.id)
}

export async function action({ request, params }) {
  await requireAuth({ request })
  const formData = await request.formData()
  const fields = readVanFields(formData)

  const error = validateVanFields(fields)
  if (error) return error

  try {
    const file = formData.get("image")
    const imageUrl = file && file.size
      ? await uploadImage(file)
      : formData.get("currentImageUrl")
    await updateVan(params.id, { ...fields, imageUrl })
  } catch (err) {
    return err.message || "Could not save your changes."
  }

  return redirect(`/host/vans/${params.id}`)
}

export default function EditVan() {
  const van = useLoaderData()
  const errorMessage = useActionData()
  return (
    <section>
      <Link to=".." relative="path" className="back-button">&larr; <span>Back to van</span></Link>
      <h1 className="host-vans-title">Edit {van.name}</h1>
      <VanForm van={van} errorMessage={errorMessage} submitLabel="Save changes" submittingLabel="Saving..." />
    </section>
  )
}