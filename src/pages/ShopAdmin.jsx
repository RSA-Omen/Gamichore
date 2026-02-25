import { useState } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './ShopAdmin.css'

const MAX_IMAGE_BYTES = 400 * 1024

export default function ShopAdmin() {
  const { shopItems: items, addShopItem, updateShopItem, deleteShopItem } = useHousehold()
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formPriceStars, setFormPriceStars] = useState('')
  const [formPriceRands, setFormPriceRands] = useState('')
  const [formImage, setFormImage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditingId(null)
    setFormName('')
    setFormPriceStars('')
    setFormPriceRands('')
    setFormImage('')
    setShowForm(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setFormName(item.name)
    setFormPriceStars(String(item.priceStars))
    setFormPriceRands(String(item.priceRands))
    setFormImage(item.image || '')
    setShowForm(true)
  }

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('Image is too large. Use an image under 400 KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setFormImage(reader.result)
    reader.readAsDataURL(file)
  }

  async function submit(e) {
    e.preventDefault()
    if (!formName.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: formName.trim(),
        priceStars: Math.max(0, parseInt(formPriceStars, 10) || 0),
        priceRands: Math.max(0, parseFloat(formPriceRands) || 0),
        image: formImage || '',
      }
      if (editingId) {
        await updateShopItem(editingId, payload)
      } else {
        await addShopItem(payload)
      }
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    if (!confirm(`Remove "${item.name}" from the shop?`)) return
    await deleteShopItem(item.id)
    setShowForm(false)
  }

  return (
    <div className="page shop-admin-page">
      <div className="page-head">
        <h1>Manage shop</h1>
        <button type="button" className="btn btn-primary" onClick={openNew}>
          Add item
        </button>
      </div>

      {showForm && (
        <form className="card shop-item-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit item' : 'New shop item'}</h3>
          <label>
            Name
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Ice cream trip"
              autoFocus
            />
          </label>
          <label>
            Price (stars)
            <input
              type="number"
              min="0"
              value={formPriceStars}
              onChange={(e) => setFormPriceStars(e.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            Price (Rands) — for your reference
            <input
              type="number"
              min="0"
              step="0.01"
              value={formPriceRands}
              onChange={(e) => setFormPriceRands(e.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            Picture
            <div className="image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
              />
              {formImage ? (
                <div className="image-preview">
                  <img src={formImage} alt="Preview" />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFormImage('')}>
                    Remove
                  </button>
                </div>
              ) : (
                <span className="image-placeholder">Upload an image</span>
              )}
            </div>
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="shop-admin-grid">
        {items.map((item) => (
          <div key={item.id} className="card shop-admin-card">
            <div className="shop-admin-card-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="shop-admin-placeholder">No image</div>
              )}
            </div>
            <div className="shop-admin-card-body">
              <h3>{item.name}</h3>
              <p className="shop-admin-prices">
                <span>{item.priceStars} ⭐</span>
                {item.priceRands > 0 && <span>R {item.priceRands}</span>}
              </p>
              <div className="shop-admin-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>
                  Edit
                </button>
                <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => remove(item)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !showForm && (
        <p className="empty-state">Add items for kids to earn with stars.</p>
      )}
    </div>
  )
}
