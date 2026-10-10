import { useState } from "react"
import { Form, useNavigation } from "react-router-dom"
import { VAN_TYPES } from "../validators/vanForm.validator"

export default function VanForm({ van, errorMessage, submitLabel, submittingLabel }) {
  const { state } = useNavigation()
  const [preview, setPreview] = useState(van?.imageUrl || null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="van-form-container">
      {errorMessage && <h3 className="red">{errorMessage}</h3>}
      <Form method="post" encType="multipart/form-data" className="van-form" replace>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" defaultValue={van?.name} required />

        <label htmlFor="price">Price per day ($)</label>
        <input id="price" name="price" type="number" min="1" step="1" defaultValue={van?.price} required />

        <label htmlFor="type">Category</label>
        <select id="type" name="type" defaultValue={van?.type || "simple"}>
          {VAN_TYPES.map(t => (
            <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="5" defaultValue={van?.description} required />

        <label htmlFor="image">Photo</label>
        {preview && <img src={preview} alt="Van preview" className="van-form-preview" />}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFile}
          required={!van}
        />
        {van && <input type="hidden" name="currentImageUrl" value={van.imageUrl} />}

        <button disabled={state === "submitting"}>
          {state === "submitting" ? submittingLabel : submitLabel}
        </button>
      </Form>
    </div>
  )
}