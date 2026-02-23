import { useParams, useNavigate } from 'react-router-dom'
import useBudgetStore from '../../stores/budgetStore'
import TransactionItem from '../../components/shared/TransactionItem'
import { formatIDR, formatDateLabel } from '../../utils/format'

export default function DetailAkunPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { accounts, getTransactionsByDate } = useBudgetStore()

    const accountId = parseInt(id)
    const account = accounts.find(a => a.id === accountId)
    const txnsByDate = getTransactionsByDate(accountId)

    if (!account) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-text-secondary">Akun tidak ditemukan</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 shadow-sm z-10 pt-4 pb-3 px-4 flex items-center justify-between shrink-0 safe-top">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-text-secondary transition-colors"
                >
                    <span className="material-icons-round text-2xl">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-bold tracking-tight text-text-primary">{account.name}</h1>
                <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-text-secondary transition-colors">
                    <span className="material-icons-round text-2xl">more_vert</span>
                </button>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {/* Balance card */}
                <div className="px-4 py-5 bg-white mb-2">
                    <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                        <div className="relative z-10 text-center">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Working Balance</p>
                            <p className="text-3xl font-bold text-text-primary tabular-nums">{formatIDR(account.balance)}</p>
                            <div className="flex items-center justify-center gap-6 mt-3 text-sm">
                                <div className="text-center">
                                    <p className="text-xs text-text-secondary">Klir</p>
                                    <p className="font-semibold text-text-primary tabular-nums">{formatIDR(account.cleared || 0)}</p>
                                </div>
                                <div className="w-px h-8 bg-gray-200" />
                                <div className="text-center">
                                    <p className="text-xs text-text-secondary">Belum Klir</p>
                                    <p className="font-semibold text-text-primary tabular-nums">{formatIDR(account.uncleared || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 text-sm font-medium text-text-secondary hover:bg-gray-100 transition-colors border border-gray-100">
                            <span className="material-icons-round text-lg text-primary">search</span>
                            Cari
                        </button>
                        <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 text-sm font-medium text-text-secondary hover:bg-gray-100 transition-colors border border-gray-100">
                            <span className="material-icons-round text-lg text-primary">sync</span>
                            Rekonsiliasi
                        </button>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-t-2xl">
                    {Object.entries(txnsByDate).map(([date, txns]) => (
                        <div key={date}>
                            <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">{formatDateLabel(date)}</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${txns.reduce((s, t) => s + t.amount, 0) >= 0
                                        ? 'text-primary bg-primary/10'
                                        : 'text-danger bg-danger/10'
                                    }`}>
                                    {formatIDR(txns.reduce((s, t) => s + t.amount, 0))}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {txns.map(txn => (
                                    <TransactionItem key={txn.id} transaction={txn} />
                                ))}
                            </div>
                        </div>
                    ))}
                    {Object.keys(txnsByDate).length === 0 && (
                        <div className="text-center py-16">
                            <span className="material-icons-round text-4xl text-gray-300 mb-3 block">receipt_long</span>
                            <p className="text-text-secondary text-sm">Belum ada transaksi di akun ini</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Add button */}
            <div className="fixed bottom-20 right-4 z-30">
                <button
                    onClick={() => navigate('/transaksi/baru')}
                    className="w-14 h-14 rounded-full bg-primary shadow-fab flex items-center justify-center active:scale-95 transition-transform"
                >
                    <span className="material-icons-round text-black text-2xl">add</span>
                </button>
            </div>
        </div>
    )
}
