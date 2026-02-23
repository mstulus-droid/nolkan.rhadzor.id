import { useState } from 'react'
import useBudgetStore from '../../stores/budgetStore'
import { formatIDR } from '../../utils/format'
import { getCategoryColorClass } from '../../utils/format'
import MonthNavigator from '../../components/shared/MonthNavigator'
import ProgressBar from '../../components/shared/ProgressBar'

export default function BajetPage() {
    const {
        categories, currentMonth, setMonth,
        getBudgetForCategory, getCategoryActivity, getCategoryAvailable,
        getCategoryGroups, getToBeBudgeted, getTotalBalance,
        allocateFunds,
    } = useBudgetStore()
    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState('')
    const [budgetNotice, setBudgetNotice] = useState('')

    const groups = getCategoryGroups()
    const tbb = getToBeBudgeted()
    const totalBalance = getTotalBalance()

    // Filter out income categories
    const budgetGroups = Object.entries(groups).filter(([g]) => g !== 'Pemasukan')

    const startEdit = (categoryId) => {
        const budget = getBudgetForCategory(categoryId, currentMonth)
        setEditingId(categoryId)
        setEditValue(budget?.budgeted ? String(budget.budgeted) : '')
    }

    const commitEdit = async (categoryId) => {
        const amount = parseInt(editValue, 10) || 0
        const result = await allocateFunds(categoryId, amount, currentMonth)
        setBudgetNotice(result?.message || '')
        setEditingId(null)
        setEditValue('')
    }

    const handleEditKey = (event, categoryId) => {
        if (event.key === 'Enter') commitEdit(categoryId)
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="safe-top px-4 pt-4 pb-2 bg-background-light shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-lg font-bold text-text-primary">Budget</h1>
                    <span className="text-xs text-text-secondary bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                        Tap angka untuk ubah
                    </span>
                </div>
                <MonthNavigator month={currentMonth} onMonthChange={setMonth} />
            </header>

            {/* TBB Banner */}
            <div className="mx-4 mb-3 bg-white rounded-xl shadow-card border border-gray-100 p-4 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tersedia Dinolkan</p>
                    <p className={`text-2xl font-bold tabular-nums mt-0.5 ${tbb < 0 ? 'text-danger' : tbb === 0 ? 'text-text-secondary' : 'text-gold'}`}>
                        {formatIDR(tbb)}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tbb < 0 ? 'bg-danger/10' : 'bg-gold/10'}`}>
                    <span className={`material-icons-round text-2xl ${tbb < 0 ? 'text-danger' : 'text-gold'}`}>
                        {tbb < 0 ? 'warning' : 'account_balance_wallet'}
                    </span>
                </div>
            </div>

            <div className="mx-4 mb-3 bg-white rounded-xl shadow-card border border-gray-100 p-4">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Saldo Akun Budget</p>
                <p className="text-xl font-bold tabular-nums text-text-primary mt-0.5">{formatIDR(totalBalance)}</p>
                <p className="text-[11px] text-text-secondary mt-1">Dana total dari akun yang masuk budget</p>
            </div>

            {budgetNotice && (
                <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-warning-light text-warning text-xs font-medium">
                    {budgetNotice}
                </div>
            )}

            {/* Category list */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24 space-y-4">
                {budgetGroups.map(([groupName, cats]) => {
                    const groupTotal = cats.reduce((s, c) => {
                        const budget = getBudgetForCategory(c.id)
                        return s + (budget?.budgeted || 0)
                    }, 0)

                    return (
                        <section key={groupName}>
                            <div className="flex items-center justify-between px-1 mb-2">
                                <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">{groupName}</h2>
                                <span className="text-xs font-medium text-text-secondary bg-gray-100 px-2 py-0.5 rounded-full">
                                    {formatIDR(groupTotal, true)}
                                </span>
                            </div>
                            <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
                                {cats.map((cat, i) => {
                                    const budget = getBudgetForCategory(cat.id)
                                    const budgeted = budget?.budgeted || 0
                                    const activity = getCategoryActivity(cat.id)
                                    const available = getCategoryAvailable(cat.id)
                                    const isEditing = editingId === cat.id
                                    const iconClass = getCategoryColorClass(cat.icon)

                                    return (
                                        <div
                                            key={cat.id}
                                            className={`flex items-center justify-between p-4 ${i < cats.length - 1 ? 'border-b border-gray-50' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>
                                                    <span className="material-icons-round text-lg">{cat.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-text-primary truncate">{cat.name}</p>
                                                    {budgeted > 0 && (
                                                        <ProgressBar activity={activity} budgeted={budgeted} className="mt-1" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-3 shrink-0">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onBlur={() => commitEdit(cat.id)}
                                                        onKeyDown={e => handleEditKey(e, cat.id)}
                                                        autoFocus
                                                        className="w-24 text-right text-sm font-semibold border border-primary rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 tabular-nums"
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(cat.id)}
                                                        className="text-sm font-semibold text-text-secondary tabular-nums hover:text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
                                                    >
                                                        {budgeted > 0 ? formatIDR(budgeted, true) : (
                                                            <span className="text-gray-300 font-normal">+ Isi</span>
                                                        )}
                                                    </button>
                                                )}
                                                <p className={`text-[11px] font-bold tabular-nums ${available < 0 ? 'text-danger' : available === 0 ? 'text-text-secondary' : 'text-primary'}`}>
                                                    {formatIDR(available)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })}
            </main>
        </div>
    )
}
