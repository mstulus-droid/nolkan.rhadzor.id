import { formatIDR } from '../../utils/format'

export default function AmountDisplay({ amount, compact = false, className = '', showSign = false }) {
    const isNegative = amount < 0
    const isPositive = amount > 0

    const colorClass = isNegative
        ? 'text-danger'
        : isPositive && showSign
            ? 'text-primary'
            : ''

    const sign = showSign && isPositive ? '+' : ''

    return (
        <span className={`tabular-nums font-mono ${colorClass} ${className}`}>
            {sign}{formatIDR(amount, compact)}
        </span>
    )
}
