// Transform Supabase snake_case to camelCase for the app

const SNAKE_TO_CAMEL = {
  household_id: 'householdId',
  chore_set_ids: 'choreSetIds',
  star_value: 'starValue',
  star_balance_override: 'starBalanceOverride',
  chore_ids: 'choreIds',
  chore_id: 'choreId',
  kid_id: 'kidId',
  shop_item_id: 'shopItemId',
  period_key: 'periodKey',
  submitted_at: 'submittedAt',
  approved_at: 'approvedAt',
  price_stars: 'priceStars',
  price_rands: 'priceRands',
  created_at: 'createdAt',
}

function toCamel(obj) {
  if (obj == null) return obj
  if (Array.isArray(obj)) return obj.map(toCamel)
  if (typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = SNAKE_TO_CAMEL[k] ?? k
    out[key] = toCamel(v)
  }
  return out
}

function toSnake(obj) {
  if (obj == null) return obj
  const CAMEL_TO_SNAKE = Object.fromEntries(
    Object.entries(SNAKE_TO_CAMEL).map(([s, c]) => [c, s])
  )
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = CAMEL_TO_SNAKE[k] ?? k
    out[key] = typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)
      ? toSnake(v)
      : v
  }
  return out
}

export { toCamel, toSnake }
