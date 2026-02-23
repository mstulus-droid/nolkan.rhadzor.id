import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBudgetStore from '../../stores/budgetStore'
import TransactionItem from '../../components/shared/TransactionItem'
import { formatIDR, formatDateLabel } from '../../utils/format'
import AccountEditorModal from '../../components/shared/AccountEditorModal'

export default function SemualAkunPage() {
    const navigate = useNavigate()
    const {
        accounts, isLoading, addAccount, updateAccount,
        getTransactionsByDate, getNetWorth,
    } = useBudgetStore()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingAccount, setEditingAccount] = useState(null)

    const totalAssets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0)
    const totalDebts = accounts.filter(a => a.balance < 0).reduce((s, a) => s + a.balance, 0)
    const netWorth = getNetWorth()
    const txnsByDate = getTransactionsByDate()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="safe-top px-5 pt-5 pb-3 bg-background-light shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-fab">
                            <span className="material-icons-round text-black text-xl">track_changes</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-text-primary">Semua Akun</h1>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-primary transition-colors"
                    >
                        <span className="material-icons-round">add</span>
                    </button>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-0.5">Aset</p>
                        <p className="text-sm font-bold text-text-primary tabular-nums">{formatIDR(totalAssets)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-0.5">Hutang</p>
                        <p className="text-sm font-bold text-danger tabular-nums">{formatIDR(Math.abs(totalDebts))}</p>
                    </div>
                </div>
            </header>

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-24">
                {/* Net Worth Card */}
                <div className="bg-white rounded-2xl shadow-soft p-5 mb-6 text-center relative overflow-hidden border border-primary/5">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark" />
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                    <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 relative z-10">Kekayaan Bersih</p>
                    <p className="text-4xl font-bold text-primary tracking-tight tabular-nums relative z-10">{formatIDR(netWorth)}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 relative z-10">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-icons-round text-[12px]">trending_up</span>
                            Februari 2026
                        </span>
                    </div>
                </div>

                {/* Accounts quick list */}
                <div className="bg-white rounded-xl shadow-card border border-gray-100 mb-6 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Akun</h2>
                        <button className="text-xs text-primary font-semibold">Lihat Semua</button>
                    </div>
                    {accounts.map((acc, i) => (
                        <button
                            key={acc.id}
                            onClick={() => navigate(`/akun/${acc.id}`)}
                            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${i < accounts.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-icons-round text-primary text-sm">account_balance</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-medium text-text-primary block">{acc.name}</span>
                                    <span className="text-[10px] text-text-secondary">
                                        {acc.inBudget ? 'Masuk budget' : 'Di luar budget'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold tabular-nums ${acc.balance < 0 ? 'text-danger' : 'text-text-primary'}`}>
                                    {formatIDR(acc.balance)}
                                </span>
                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setEditingAccount(acc)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setEditingAccount(acc)
                                        }
                                    }}
                                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-secondary"
                                >
                                    <span className="material-icons-round text-base">edit</span>
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Transactions by date */}
                <div className="space-y-5">
                    {Object.entries(txnsByDate).map(([date, txns]) => (
                        <section key={date}>
                            <div className="flex items-center justify-between px-1 mb-2">
                                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">{formatDateLabel(date)}</h3>
                                <span className="text-xs text-text-secondary opacity-70">
                                    {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                            <div className="bg-white rounded-xl shadow-card border border-gray-50 overflow-hidden divide-y divide-gray-50">
                                {txns.map(txn => (
                                    <TransactionItem key={txn.id} transaction={txn} />
                                ))}
                            </div>
                        </section>
                    ))}
                    {Object.keys(txnsByDate).length === 0 && (
                        <div className="text-center py-12">
                            <span className="material-icons-round text-4xl text-gray-300 mb-3 block">receipt_long</span>
                            <p className="text-text-secondary text-sm">Belum ada transaksi</p>
                            <p className="text-text-secondary text-xs mt-1">Tap tombol + untuk menambah</p>
                        </div>
                    )}
                </div>
            </main>

            <AccountEditorModal
                open={showCreateModal}
                title="Tambah Akun"
                onClose={() => setShowCreateModal(false)}
                onSubmit={addAccount}
            />

            <AccountEditorModal
                open={Boolean(editingAccount)}
                title="Edit Akun"
                initialAccount={editingAccount}
                onClose={() => setEditingAccount(null)}
                onSubmit={(payload) => updateAccount(editingAccount.id, payload)}
            />
        </div>
    )
}
