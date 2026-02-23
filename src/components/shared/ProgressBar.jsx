import { formatIDR } from '../../utils/format'

export default function ProgressBar({ activity, budgeted, className = '' }) {
    const percent = budgeted > 0 ? Math.min(100, (activity / budgeted) * 100) : 0
    const isOver = activity > budgeted && budgeted > 0
    const isWarning = !isOver && budgeted > 0 && percent > 80

    const barColor = isOver
        ? 'bg-danger'
        : isWarning
            ? 'bg-warning'
            : 'bg-primary'

    return (
        <div className={`w-full bg-gray-100 rounded-full h-1 overflow-hidden ${className}`}>
            <div
                className={`h-1 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percent}%` }}
            />
        </div>
    )
}
