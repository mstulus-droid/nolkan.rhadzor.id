import { useState } from 'react'
import useBudgetStore from '../../stores/budgetStore'
import { formatIDR } from '../../utils/format'
import { getCategoryColorClass } from '../../utils/format'
import MonthNavigator from '../../components/shared/MonthNavigator'
import ProgressBar from '../../components/shared/ProgressBar'

export default function NolkanBudgetPage() {
    const {
        categories, currentMonth, setMonth,
        getBudgetForCategory, getCategoryActivity, getCategoryAvailable,
        getCategoryGroups, getToBeBudgeted, getTotalIncome, getTotalBudgeted, getTotalBalance,
        allocateFunds,
    } = useBudgetStore()

    const [editingId, setEditingId] = useState(null)
    const [editValue, setEditValue] = useState('')
    const [collapsedGroups, setCollapsedGroups] = useState({})
    const [budgetNotice, setBudgetNotice] = useState('')

    const groups = getCategoryGroups()
    const tbb = getToBeBudgeted()
    const totalIncome = getTotalIncome()
    const totalBudgeted = getTotalBudgeted()
    const totalBalance = getTotalBalance()

    const budgetGroups = Object.entries(groups).filter(([g]) => g !== 'Pemasukan')

    const toggleGroup = (groupName) => {
        setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))
    }

    const startEdit = (cat) => {
        const budget = getBudgetForCategory(cat.id)
        setEditingId(cat.id)
        setEditValue(budget?.budgeted ? String(budget.budgeted) : '')
    }

    const commitEdit = async (categoryId) => {
        const amount = parseInt(editValue, 10) || 0
        const result = await allocateFunds(categoryId, amount, currentMonth)
        setBudgetNotice(result?.message || '')
        setEditingId(null)
        setEditValue('')
    }

    const handleKeyDown = (e, categoryId) => {
        if (e.key === 'Enter') commitEdit(categoryId)
        if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
    }

    return (
        <div className="min-h-full">
            {/* Page header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <MonthNavigator month={currentMonth} onMonthChange={setMonth} />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium text-text-secondary hover:bg-gray-200 transition-colors">
                        <span className="material-icons-round text-lg">add</span>
                        Tambah Kategori
                    </button>
                </div>
            </div>

            <div className="px-8 py-6">
                {/* Top stats row */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {/* In Budget Accounts */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Saldo Akun Budget</p>
                        <p className="text-2xl font-bold text-text-primary tabular-nums">{formatIDR(totalBalance)}</p>
                        <p className="text-xs text-text-secondary mt-1">Total akun yang masuk budget</p>
                    </div>

                    {/* TBB Card */}
                    <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-soft p-5 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-gold/10 rounded-full blur-2xl" />
                        <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 relative z-10">
                            Tersedia Dinolkan
                        </p>
                        <p className={`text-3xl font-bold tabular-nums relative z-10 ${tbb < 0 ? 'text-danger' : tbb === 0 ? 'text-text-secondary' : 'text-gold'
                            }`}>
                            {formatIDR(tbb)}
                        </p>
                        <p className="text-xs text-text-secondary mt-1 relative z-10">Dana belum dialokasikan</p>
                    </div>

                    {/* Income */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Pemasukan</p>
                        <p className="text-2xl font-bold text-primary tabular-nums">{formatIDR(totalIncome)}</p>
                        <p className="text-xs text-text-secondary mt-1">Bulan ini</p>
                    </div>

                    {/* Budgeted */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Dialokasikan</p>
                        <p className="text-2xl font-bold text-text-primary tabular-nums">{formatIDR(totalBudgeted)}</p>
                        <div className="mt-2">
                            <ProgressBar
                                activity={totalBudgeted}
                                budgeted={totalIncome}
                            />
                            <p className="text-xs text-text-secondary mt-1">
                                {totalIncome > 0 ? Math.round((totalBudgeted / totalIncome) * 100) : 0}% dari pemasukan
                            </p>
                        </div>
                    </div>
                </div>

                {budgetNotice && (
                    <div className="mb-4 px-4 py-2.5 rounded-xl bg-warning-light text-warning text-sm font-medium">
                        {budgetNotice}
                    </div>
                )}

                {/* Budget Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[1fr_140px_140px_140px] gap-0 px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Kategori</div>
                        <div className="text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Anggaran</div>
                        <div className="text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Keluar</div>
                        <div className="text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Sisa</div>
                    </div>

                    {/* Category groups */}
                    {budgetGroups.map(([groupName, cats]) => {
                        const isCollapsed = collapsedGroups[groupName]
                        const groupBudgeted = cats.reduce((s, c) => {
                            const b = getBudgetForCategory(c.id)
                            return s + (b?.budgeted || 0)
                        }, 0)
                        const groupActivity = cats.reduce((s, c) => s + getCategoryActivity(c.id), 0)
                        const groupAvailable = cats.reduce((s, c) => s + getCategoryAvailable(c.id), 0)

                        return (
                            <div key={groupName}>
                                {/* Group header */}
                                <button
                                    onClick={() => toggleGroup(groupName)}
                                    className="w-full grid grid-cols-[1fr_140px_140px_140px] gap-0 px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors bg-gray-50/50"
                                >
                                    <div className="flex items-center gap-2 text-left">
                                        <span className={`material-icons-round text-primary text-sm transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>
                                            expand_more
                                        </span>
                                        <span className="text-sm font-bold text-text-primary uppercase tracking-wide">{groupName}</span>
                                    </div>
                                    <div className="text-right text-xs font-semibold text-text-secondary tabular-nums self-center">
                                        {formatIDR(groupBudgeted, true)}
                                    </div>
                                    <div className="text-right text-xs font-semibold text-text-secondary tabular-nums self-center">
                                        {formatIDR(groupActivity, true)}
                                    </div>
                                    <div className={`text-right text-xs font-bold tabular-nums self-center ${groupAvailable < 0 ? 'text-danger' : 'text-text-secondary'
                                        }`}>
                                        {formatIDR(groupAvailable, true)}
                                    </div>
                                </button>

                                {/* Category rows */}
                                {!isCollapsed && cats.map((cat, i) => {
                                    const budget = getBudgetForCategory(cat.id)
                                    const budgeted = budget?.budgeted || 0
                                    const activity = getCategoryActivity(cat.id)
                                    const available = getCategoryAvailable(cat.id)
                                    const isEditing = editingId === cat.id
                                    const iconClass = getCategoryColorClass(cat.icon)

                                    return (
                                        <div
                                            key={cat.id}
                                            className={`grid grid-cols-[1fr_140px_140px_140px] gap-0 px-5 py-3 border-b border-gray-50 budget-row group ${available < 0 ? 'bg-danger/[0.02]' : ''
                                                }`}
                                        >
                                            {/* Category name */}
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>
                                                    <span className="material-icons-round text-sm">{cat.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                                                    {budgeted > 0 && (
                                                        <ProgressBar activity={activity} budgeted={budgeted} className="w-32 mt-1" />
                                                    )}
                                                </div>
                                                {available < 0 && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                                                )}
                                            </div>

                                            {/* Budgeted (editable) */}
                                            <div className="flex items-center justify-end">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onBlur={() => commitEdit(cat.id)}
                                                        onKeyDown={e => handleKeyDown(e, cat.id)}
                                                        autoFocus
                                                        className="w-28 text-right text-sm font-semibold border border-primary rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 tabular-nums"
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(cat)}
                                                        className="text-sm font-semibold text-text-secondary tabular-nums hover:text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors group-hover:bg-gray-100"
                                                    >
                                                        {budgeted > 0 ? formatIDR(budgeted, true) : (
                                                            <span className="text-gray-300 font-normal">+ Isi</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Activity */}
                                            <div className="flex items-center justify-end">
                                                <span className="text-sm text-text-secondary tabular-nums">
                                                    {activity > 0 ? formatIDR(activity, true) : <span className="text-gray-300">-</span>}
                                                </span>
                                            </div>

                                            {/* Available */}
                                            <div className="flex items-center justify-end">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold tabular-nums ${available < 0
                                                        ? 'bg-danger/10 text-danger'
                                                        : available === 0
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : budgeted > 0
                                                                ? 'bg-primary text-black'
                                                                : 'bg-primary/20 text-green-700'
                                                    }`}>
                                                    {formatIDR(available, true)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
