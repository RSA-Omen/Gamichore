import { useState } from 'react'
import { useHousehold } from '../contexts/HouseholdContext'
import './Shop.css'

export default function Shop({ kidId, setKidId, initialKidId = null, singleKidMode = false, simpleMode = false }) {
  const { kids, shopItems: items, getStarBalance, redeemItem } = useHousehold()
  const [selectedKidId, setSelectedKidId] = useState(initialKidId || kidId || (kids.length ? kids[0]?.id : null))
  const [redeemingId, setRedeemingId] = useState(null)

  const balance = selectedKidId ? getStarBalance(selectedKidId) : 0

  async function handleRedeem(item) {
    if (!selectedKidId) return
    if (balance < item.priceStars) return
    setRedeemingId(item.id)
    try {
      const result = await redeemItem(selectedKidId, item.id)
      if (result?.error) alert(result.error)
    } finally {
      setRedeemingId(null)
    }
  }

  const selectedKid = kids.find((k) => k.id === selectedKidId)

  return (
    <div className={`page shop-page ${simpleMode ? 'shop-simple' : ''}`}>
      <h1>Shop</h1>

      {kids.length === 0 ? (
        <p className="empty-state">Add kids first, then they can spend stars here.</p>
      ) : (
        <>
          {!singleKidMode && (
            <div className="shop-kid-picker card">
              <label>Who is shopping?</label>
              <div className="kid-picker-buttons">
                {kids.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    className={`btn kid-picker-btn ${selectedKidId === k.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedKidId(k.id)
                      setKidId?.(k.id)
                    }}
                  >
                    <span className="kid-picker-avatar">{k.avatar || '👤'}</span>
                    {k.name}
                  </button>
                ))}
              </div>
              {selectedKid && (
                <p className="shop-balance">
                  Balance: <strong>{balance} ★</strong>
                </p>
              )}
            </div>
          )}

          <div className="shop-grid">
            {items.map((item) => {
              const affordable = selectedKidId && balance >= item.priceStars
              const redeeming = redeemingId === item.id
              return (
                <div
                  key={item.id}
                  className={`shop-item-card ${affordable ? 'affordable' : ''} ${redeeming ? 'redeeming' : ''}`}
                >
                  <div className="shop-item-border">
                    <div className="shop-item-image">
                      {item.image ? (
                        <img src={item.image} alt="" />
                      ) : (
                        <span className="shop-item-no-image">★</span>
                      )}
                    </div>
                    <div className="shop-item-info">
                      <h3>{item.name}</h3>
                      <p className="shop-item-price">
                        <span className="shop-item-stars">{item.priceStars} ★</span>
                        {item.priceRands > 0 && (
                          <span className="shop-item-rands">R{item.priceRands}</span>
                        )}
                        {item.itemType === 'screen_time' && item.screenTimeMinutes != null && (
                          <span className="shop-item-screen-time">📱 {item.screenTimeMinutes} min</span>
                        )}
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary shop-item-redeem"
                        onClick={() => handleRedeem(item)}
                        disabled={!affordable || redeeming}
                      >
                        {redeeming ? 'Redeeming...' : 'Redeem'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {items.length === 0 && (
            <p className="empty-state">Add shop items in Manage account → Manage shop.</p>
          )}
        </>
      )}
    </div>
  )
}
