import { formatIDR } from '../../utils/format'

const ACCOUNT_ICONS = {
    checking: 'account_balance',
    savings: 'savings',
    cash: 'wallet',
    credit: 'credit_card',
    investment: 'trending_up',
}

const ACCOUNT_COLORS = {
    checking: 'from-blue-500 to-blue-600',
    savings: 'from-emerald-500 to-emerald-600',
    cash: 'from-amber-500 to-amber-600',
    credit: 'from-red-500 to-red-600',
    investment: 'from-purple-500 to-purple-600',
}

export default function AccountCard({ account, onClick, compact = false }) {
    const icon = ACCOUNT_ICONS[account.type] || 'account_balance_wallet'
    const gradient = ACCOUNT_COLORS[account.type] || 'from-gray-500 to-gray-600'

    if (compact) {
        return (
            <div
                className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => onClick?.(account)}
            >
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${gradient}`} />
                    <span className="text-sm font-medium text-text-primary">{account.name}</span>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${account.balance < 0 ? 'text-danger' : 'text-text-primary'}`}>
                    {formatIDR(account.balance)}
                </span>
            </div>
        )
    }

    return (
        <div
            className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 cursor-pointer hover:shadow-soft transition-all active:scale-[0.98]"
            onClick={() => onClick?.(account)}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                    <span className="material-icons-round text-white text-xl">{icon}</span>
                </div>
                <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded-full capitalize">
                    {account.type}
                </span>
            </div>
            <h3 className="font-semibold text-text-primary text-sm mb-1">{account.name}</h3>
            <p className={`text-xl font-bold tabular-nums ${account.balance < 0 ? 'text-danger' : 'text-text-primary'}`}>
                {formatIDR(account.balance)}
            </p>
            {account.uncleared > 0 && (
                <p className="text-xs text-text-secondary mt-1">
                    Belum klir: {formatIDR(account.uncleared)}
                </p>
            )}
        </div>
    )
}
