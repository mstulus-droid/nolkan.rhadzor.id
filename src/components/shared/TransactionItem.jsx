import useBudgetStore from '../../stores/budgetStore'
import { formatIDR, getCategoryColorClass } from '../../utils/format'

export default function TransactionItem({ transaction, onClick }) {
    const { getCategoryById, getAccountById } = useBudgetStore()
    const category = getCategoryById(transaction.categoryId)
    const account = getAccountById(transaction.accountId)
    const transferAccount = getAccountById(transaction.transferAccountId)

    const isIncome = transaction.type === 'income'
    const isTransfer = transaction.type === 'transfer'
    const isPositive = transaction.amount > 0
    const iconColorClass = isTransfer ? 'bg-sky-100 text-sky-600' : getCategoryColorClass(category?.icon)
    const detailParts = []

    if (account?.name) detailParts.push(account.name)
    if (isTransfer && transferAccount?.name) {
        detailParts.push(transaction.amount < 0 ? `Transfer ke ${transferAccount.name}` : `Transfer dari ${transferAccount.name}`)
    } else if (category?.name) {
        detailParts.push(category.name)
    }

    return (
        <div
            className="p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onClick?.(transaction)}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColorClass}`}>
                    <span className="material-icons-round text-xl">{isTransfer ? 'swap_horiz' : category?.icon || 'receipt'}</span>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-text-primary text-sm truncate">
                        {transaction.payee || (isTransfer ? 'Transfer' : 'Transaksi')}
                    </span>
                    <span className="text-xs text-text-secondary truncate">
                        {detailParts.join(' - ')}
                    </span>
                </div>
            </div>
            <div className="text-right shrink-0 ml-2">
                <span className={`block font-bold text-sm tabular-nums ${isIncome || isPositive ? 'text-primary' : 'text-text-primary'}`}>
                    {isPositive ? '+' : ''}{formatIDR(transaction.amount)}
                </span>
                {!transaction.cleared && (
                    <span className="text-[10px] text-warning bg-warning-light px-1.5 py-0.5 rounded">Belum Klir</span>
                )}
            </div>
        </div>
    )
}
