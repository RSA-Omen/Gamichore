import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useHousehold } from '../contexts/HouseholdContext'
import KidPicker from './KidPicker'
import KidToday from './KidToday'
import Shop from './Shop'
import './KidView.css'

export default function KidView() {
  const [searchParams] = useSearchParams()
  const kidParam = searchParams.get('kid')
  const { kids } = useHousehold()
  const validKid = kidParam && kids.some((k) => k.id === kidParam) ? kidParam : null
  const [tab, setTab] = useState('today')
  const kid = kids.find((k) => k.id === validKid)

  if (validKid) {
    return (
      <div className="kid-view">
        <div className="kid-view-tabs">
          <button
            type="button"
            className={tab === 'today' ? 'active' : ''}
            onClick={() => setTab('today')}
          >
            Today
          </button>
          <button
            type="button"
            className={tab === 'shop' ? 'active' : ''}
            onClick={() => setTab('shop')}
          >
            Shop
          </button>
        </div>
        {tab === 'today' ? (
          <KidToday kidId={validKid} kid={kid} />
        ) : (
          <Shop initialKidId={validKid} singleKidMode simpleMode={kid?.uiMode === 'simple'} />
        )}
      </div>
    )
  }

  return <KidPicker />
}
