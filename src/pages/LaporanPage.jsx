import useBudgetStore from '../stores/budgetStore'
import { formatIDR } from '../utils/format'

export default function LaporanPage() {
    const { transactions, categories, currentMonth, getCategoryActivity, getCategoryGroups } = useBudgetStore()

    const monthTxns = transactions.filter(t => t.date.startsWith(currentMonth))
    const totalExpense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)
    const totalIncome = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

    const groups = getCategoryGroups()
    const budgetGroups = Object.entries(groups).filter(([g]) => g !== 'Pemasukan')

    return (
        <div className="min-h-full px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-text-primary mb-6">Laporan</h1>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Pemasukan</p>
                    <p className="text-2xl font-bold text-primary tabular-nums">{formatIDR(totalIncome)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Pengeluaran</p>
                    <p className="text-2xl font-bold text-danger tabular-nums">{formatIDR(totalExpense)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Selisih</p>
                    <p className={`text-2xl font-bold tabular-nums ${totalIncome - totalExpense >= 0 ? 'text-primary' : 'text-danger'}`}>
                        {formatIDR(totalIncome - totalExpense)}
                    </p>
                </div>
            </div>

            {/* Spending by category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-text-primary">Pengeluaran per Kategori</h2>
                </div>
                <div className="p-5 space-y-4">
                    {budgetGroups.map(([groupName, cats]) => {
                        const groupTotal = cats.reduce((s, c) => s + getCategoryActivity(c.id), 0)
                        if (groupTotal === 0) return null
                        return (
                            <div key={groupName}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">{groupName}</h3>
                                    <span className="text-sm font-bold text-text-primary tabular-nums">{formatIDR(groupTotal)}</span>
                                </div>
                                <div className="space-y-2">
                                    {cats.map(cat => {
                                        const activity = getCategoryActivity(cat.id)
                                        if (activity === 0) return null
                                        const pct = totalExpense > 0 ? (activity / totalExpense) * 100 : 0
                                        return (
                                            <div key={cat.id} className="flex items-center gap-3">
                                                <span className="material-icons-round text-text-secondary text-sm w-5">{cat.icon}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-medium text-text-primary">{cat.name}</span>
                                                        <span className="text-text-secondary tabular-nums">{formatIDR(activity)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                    {totalExpense === 0 && (
                        <div className="text-center py-8">
                            <span className="material-icons-round text-4xl text-gray-300 mb-2 block">bar_chart</span>
                            <p className="text-text-secondary text-sm">Belum ada pengeluaran bulan ini</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
