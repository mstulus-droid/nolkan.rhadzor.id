import { useParams, useNavigate } from 'react-router-dom'
import useBudgetStore from '../../stores/budgetStore'
import TransactionItem from '../../components/shared/TransactionItem'
import { formatIDR, formatDateLabel } from '../../utils/format'

export default function AkunDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { accounts, getTransactionsByDate } = useBudgetStore()

    const accountId = parseInt(id)
    const account = accounts.find(a => a.id === accountId)
    const txnsByDate = getTransactionsByDate(accountId)

    if (!account) return (
        <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">Akun tidak ditemukan</p>
        </div>
    )

    return (
        <div className="min-h-full px-8 py-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/akun')} className="p-2 rounded-xl hover:bg-gray-100 text-text-secondary transition-colors">
                    <span className="material-icons-round">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-text-primary">{account.name}</h1>
            </div>

            {/* Balance summary */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Saldo</p>
                    <p className="text-2xl font-bold text-text-primary tabular-nums">{formatIDR(account.balance)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Klir</p>
                    <p className="text-2xl font-bold text-primary tabular-nums">{formatIDR(account.cleared || 0)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Belum Klir</p>
                    <p className="text-2xl font-bold text-warning tabular-nums">{formatIDR(account.uncleared || 0)}</p>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-text-primary">Transaksi</h2>
                    <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                        <span className="material-icons-round text-lg">search</span>
                        Cari
                    </button>
                </div>
                {Object.entries(txnsByDate).map(([date, txns]) => (
                    <div key={date}>
                        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{formatDateLabel(date)}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${txns.reduce((s, t) => s + t.amount, 0) >= 0
                                    ? 'text-primary bg-primary/10'
                                    : 'text-danger bg-danger/10'
                                }`}>
                                {formatIDR(txns.reduce((s, t) => s + t.amount, 0))}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {txns.map(txn => <TransactionItem key={txn.id} transaction={txn} />)}
                        </div>
                    </div>
                ))}
                {Object.keys(txnsByDate).length === 0 && (
                    <div className="text-center py-16">
                        <span className="material-icons-round text-4xl text-gray-300 mb-3 block">receipt_long</span>
                        <p className="text-text-secondary">Belum ada transaksi</p>
                    </div>
                )}
            </div>
        </div>
    )
}
