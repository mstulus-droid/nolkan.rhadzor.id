// Format number as IDR currency
export function formatIDR(amount, compact = false) {
    const abs = Math.abs(amount)

    if (compact) {
        if (abs >= 1000000000) return `${(amount / 1000000000).toFixed(1)}M`
        if (abs >= 1000000) return `${(amount / 1000000).toFixed(1)}jt`
        if (abs >= 1000) return `${(amount / 1000).toFixed(0)}k`
        return `${amount}`
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Format date string to Indonesian label
export function formatDateLabel(dateStr) {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (dateStr === todayStr) return 'Hari Ini'
    if (dateStr === yesterdayStr) return 'Kemarin'

    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Format month string (2026-02) to Indonesian
export function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

// Navigate month
export function addMonths(monthStr, delta) {
    const [year, month] = monthStr.split('-').map(Number)
    const date = new Date(year, month - 1 + delta, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Get color class based on available amount
export function getAvailableColor(available, budgeted) {
    if (available < 0) return 'danger'
    if (budgeted > 0 && available === 0) return 'neutral'
    if (budgeted > 0 && available / budgeted < 0.2) return 'warning'
    return 'success'
}

// Get progress percentage
export function getProgressPercent(activity, budgeted) {
    if (!budgeted || budgeted === 0) return 0
    return Math.min(100, Math.round((activity / budgeted) * 100))
}

// Category icon color map
export const CATEGORY_COLORS = {
    restaurant: 'bg-blue-100 text-blue-600',
    local_grocery_store: 'bg-orange-100 text-orange-600',
    directions_bus: 'bg-purple-100 text-purple-600',
    pets: 'bg-teal-100 text-teal-600',
    lightbulb: 'bg-yellow-100 text-yellow-600',
    wifi: 'bg-indigo-100 text-indigo-600',
    home: 'bg-red-100 text-red-600',
    savings: 'bg-emerald-100 text-emerald-600',
    flight: 'bg-pink-100 text-pink-600',
    movie: 'bg-amber-100 text-amber-700',
    local_hospital: 'bg-red-100 text-red-500',
    payments: 'bg-green-100 text-green-600',
    shopping_bag: 'bg-orange-100 text-orange-600',
    local_cafe: 'bg-amber-100 text-amber-700',
    electric_bolt: 'bg-blue-100 text-blue-600',
    storefront: 'bg-gray-100 text-gray-600',
}

export function getCategoryColorClass(icon) {
    return CATEGORY_COLORS[icon] || 'bg-gray-100 text-gray-600'
}
