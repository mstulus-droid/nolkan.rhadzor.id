import { useNavigate } from 'react-router-dom'
import useBudgetStore from '../../stores/budgetStore'
import AccountCard from '../../components/shared/AccountCard'
import TransactionItem from '../../components/shared/TransactionItem'
import { formatIDR } from '../../utils/format'

export default function AkunListPage() {
    const navigate = useNavigate()
    const { accounts, getTransactionsByDate } = useBudgetStore()
    const txnsByDate = getTransactionsByDate()
    const recentDates = Object.keys(txnsByDate).slice(0, 3)

    return (
        <div className="min-h-full px-8 py-6">
            <h1 className="text-2xl font-bold text-text-primary mb-6">Semua Akun</h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {accounts.map(acc => (
                    <AccountCard key={acc.id} account={acc} onClick={(a) => navigate(`/akun/${a.id}`)} />
                ))}
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
        </div>
    )
}
