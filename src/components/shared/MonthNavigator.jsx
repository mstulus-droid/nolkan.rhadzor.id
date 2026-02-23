import { formatMonth, addMonths } from '../../utils/format'

export default function MonthNavigator({ month, onMonthChange, className = '' }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={() => onMonthChange(addMonths(month, -1))}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors text-text-secondary"
            >
                <span className="material-icons-round text-xl">chevron_left</span>
            </button>
            <h1 className="text-base font-bold text-text-primary tracking-tight min-w-[140px] text-center">
                {formatMonth(month)}
            </h1>
            <button
                onClick={() => onMonthChange(addMonths(month, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors text-text-secondary"
            >
                <span className="material-icons-round text-xl">chevron_right</span>
            </button>
        </div>
    )
}
