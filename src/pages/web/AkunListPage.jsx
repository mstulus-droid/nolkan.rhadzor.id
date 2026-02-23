import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBudgetStore from '../../stores/budgetStore'
import AccountCard from '../../components/shared/AccountCard'
import TransactionItem from '../../components/shared/TransactionItem'
import AccountEditorModal from '../../components/shared/AccountEditorModal'

export default function AkunListPage() {
    const navigate = useNavigate()
    const { accounts, getTransactionsByDate, addAccount, updateAccount } = useBudgetStore()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingAccount, setEditingAccount] = useState(null)
    const txnsByDate = getTransactionsByDate()
    const recentDates = Object.keys(txnsByDate).slice(0, 3)

    return (
        <div className="min-h-full px-8 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Semua Akun</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-semibold"
                >
                    <span className="material-icons-round text-lg">add</span>
                    Tambah Akun
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {accounts.map(acc => (
                    <AccountCard key={acc.id} account={acc} onClick={(a) => navigate(`/akun/${a.id}`)} />
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden mb-8">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-text-primary">Kelola Akun</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {accounts.map((acc) => (
                        <div key={acc.id} className="px-5 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">{acc.name}</p>
                                <p className="text-xs text-text-secondary">
                                    {acc.inBudget ? 'Masuk budget' : 'Di luar budget'}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingAccount(acc)}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <h2 className="text-lg font-bold text-text-primary mb-4">Transaksi Terbaru</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                {recentDates.map(date => (
                    <div key={date}>
                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {txnsByDate[date].map(txn => (
                                <TransactionItem key={txn.id} transaction={txn} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

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
