import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useBudgetStore from '../../stores/budgetStore'
import { formatIDR } from '../../utils/format'

export default function Keypad({ onClose }) {
    const navigate = useNavigate()
    const { accounts, categories, addTransaction } = useBudgetStore()
    const [amount, setAmount] = useState('')
    const [payee, setPayee] = useState('')
    const [note, setNote] = useState('')
    const [type, setType] = useState('expense') // expense | income | transfer
    const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || null)
    const [selectedTargetAccount, setSelectedTargetAccount] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [saving, setSaving] = useState(false)
    const [showAccountPicker, setShowAccountPicker] = useState(false)
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)
    const [accountPickerMode, setAccountPickerMode] = useState('from')

    const budgetAccounts = accounts.filter(a => a.inBudget)
    const budgetCategories = categories.filter(c => c.group !== 'Pemasukan')
    const incomeCategories = categories.filter(c => c.group === 'Pemasukan')

    useEffect(() => {
        if (!selectedAccount && budgetAccounts.length > 0) {
            setSelectedAccount(budgetAccounts[0].id)
        }
    }, [budgetAccounts, selectedAccount])

    const displayAmount = amount ? formatIDR(parseInt(amount) || 0) : 'Rp 0'

    const handleKey = (key) => {
        if (key === 'backspace') {
            setAmount(prev => prev.slice(0, -1))
        } else if (key === '000') {
            setAmount(prev => (prev ? prev + '000' : ''))
        } else {
            setAmount(prev => {
                const next = prev + key
                if (parseInt(next) > 999999999) return prev
                return next
            })
        }
    }

    const handleSave = async () => {
        if (!amount || !selectedAccount) return
        setSaving(true)

        try {
            const amountNum = Math.abs(parseInt(amount, 10) || 0)
            if (!amountNum) return

            const today = new Date().toISOString().split('T')[0]

            if (type === 'transfer') {
                if (!selectedTargetAccount || selectedTargetAccount === selectedAccount) return
                await addTransaction({
                    date: today,
                    payee: payee || '',
                    accountId: selectedAccount,
                    targetAccountId: selectedTargetAccount,
                    amount: amountNum,
                    type,
                    note,
                    cleared: false,
                })
            } else {
                const fallbackCategory = type === 'income'
                    ? incomeCategories[0]?.id
                    : budgetCategories[0]?.id
                const resolvedCategory = selectedCategory || fallbackCategory
                if (!resolvedCategory) return

                await addTransaction({
                    date: today,
                    payee: payee || (type === 'income' ? 'Pemasukan' : 'Pengeluaran'),
                    accountId: selectedAccount,
                    categoryId: resolvedCategory,
                    amount: type === 'expense' ? -amountNum : amountNum,
                    type,
                    note,
                    cleared: false,
                })
            }

            onClose?.()
            navigate('/')
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const selectedAccountObj = accounts.find(a => a.id === selectedAccount)
    const selectedTargetAccountObj = accounts.find(a => a.id === selectedTargetAccount)
    const selectedCategoryObj = categories.find(c => c.id === selectedCategory)

    const canSave = type === 'transfer'
        ? Boolean(amount && selectedAccount && selectedTargetAccount && selectedTargetAccount !== selectedAccount)
        : Boolean(amount && selectedAccount && (selectedCategory || (type === 'income' ? incomeCategories.length : budgetCategories.length)))

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Amount display */}
            <div className="flex flex-col items-center justify-center py-6 px-6">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    {type === 'income' ? 'Pemasukan' : type === 'transfer' ? 'Transfer' : 'Pengeluaran'}
                </p>
                <div className={`text-4xl font-bold tracking-tight tabular-nums ${type === 'income' ? 'text-primary' : type === 'expense' ? 'text-text-primary' : 'text-blue-600'
                    }`}>
                    {displayAmount}
                </div>
            </div>

            {/* Type selector */}
            <div className="flex bg-gray-100 mx-4 p-1 rounded-xl mb-4">
                {['expense', 'income', 'transfer'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${type === t
                                ? t === 'income'
                                    ? 'bg-white text-primary shadow-sm'
                                    : t === 'transfer'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'bg-white text-text-primary shadow-sm'
                                : 'text-text-secondary'
                            }`}
                    >
                        {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer'}
                    </button>
                ))}
            </div>

            {/* Form fields */}
            <div className="px-4 space-y-0 mb-3">
                {/* Payee */}
                <div className="flex items-center border-b border-gray-100 py-2.5">
                    <span className="material-icons-round text-text-secondary text-xl w-8">storefront</span>
                    <input
                        className="flex-1 ml-3 bg-transparent border-none text-text-primary placeholder-text-secondary focus:ring-0 p-0 text-sm"
                        placeholder="Penerima / Keterangan"
                        value={payee}
                        onChange={e => setPayee(e.target.value)}
                    />
                </div>

                {/* Account & Category */}
                <div className="flex gap-3">
                    <button
                        className="flex-1 flex items-center border-b border-gray-100 py-2.5 text-left"
                        onClick={() => {
                            setAccountPickerMode('from')
                            setShowAccountPicker(true)
                        }}
                    >
                        <span className="material-icons-round text-text-secondary text-xl w-8">account_balance_wallet</span>
                        <span className="flex-1 ml-3 text-sm font-medium text-text-primary truncate">
                            {selectedAccountObj?.name || 'Dari Akun'}
                        </span>
                        <span className="material-icons-round text-gray-300 text-sm">expand_more</span>
                    </button>
                    {type === 'transfer' ? (
                        <button
                            className="flex-1 flex items-center border-b border-gray-100 py-2.5 text-left"
                            onClick={() => {
                                setAccountPickerMode('to')
                                setShowAccountPicker(true)
                            }}
                        >
                            <span className="material-icons-round text-text-secondary text-xl w-8">sync_alt</span>
                            <span className="flex-1 ml-3 text-sm font-medium text-text-primary truncate">
                                {selectedTargetAccountObj?.name || 'Ke Akun'}
                            </span>
                            <span className="material-icons-round text-gray-300 text-sm">expand_more</span>
                        </button>
                    ) : (
                        <button
                            className="flex-1 flex items-center border-b border-gray-100 py-2.5 text-left"
                            onClick={() => setShowCategoryPicker(true)}
                        >
                            <span className="material-icons-round text-text-secondary text-xl w-8">category</span>
                            <span className="flex-1 ml-3 text-sm font-medium text-text-primary truncate">
                                {selectedCategoryObj?.name || 'Kategori'}
                            </span>
                            <span className="material-icons-round text-gray-300 text-sm">expand_more</span>
                        </button>
                    )}
                </div>

                {/* Note */}
                <div className="flex items-center border-b border-gray-100 py-2.5">
                    <span className="material-icons-round text-text-secondary text-xl w-8">edit_note</span>
                    <input
                        className="flex-1 ml-3 bg-transparent border-none text-text-primary placeholder-text-secondary focus:ring-0 p-0 text-sm"
                        placeholder="Catatan (opsional)"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                </div>
            </div>

            {/* Keypad */}
            <div className="bg-gray-50 px-3 pt-2 pb-2 flex-1">
                <div className="grid grid-cols-4 gap-2">
                    {['1', '2', '3', 'backspace', '4', '5', '6', '', '7', '8', '9', '', '0', '000', '', 'save'].map((key, i) => {
                        if (key === '') return <div key={i} />
                        if (key === 'backspace') return (
                            <button key={i} onClick={() => handleKey('backspace')}
                                className="h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center active:scale-95 transition-transform shadow-sm">
                                <span className="material-icons-round">backspace</span>
                            </button>
                        )
                        if (key === 'save') return (
                            <button key={i} onClick={handleSave} disabled={!canSave || saving}
                                className="col-span-2 h-12 rounded-xl bg-primary disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-fab">
                                <span className="material-icons-round text-black text-xl">check</span>
                                <span className="font-bold text-black text-sm">SIMPAN</span>
                            </button>
                        )
                        return (
                            <button key={i} onClick={() => handleKey(key)}
                                className="h-12 rounded-xl bg-white text-text-primary text-xl font-semibold shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
                                {key}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Account Picker */}
            <AnimatePresence>
                {showAccountPicker && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 z-50 flex items-end"
                        onClick={() => setShowAccountPicker(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full bg-white rounded-t-3xl p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="font-bold text-text-primary mb-4">
                                {accountPickerMode === 'to' ? 'Pilih Akun Tujuan' : 'Pilih Akun Sumber'}
                            </h3>
                            <div className="space-y-2">
                                {budgetAccounts
                                    .filter(acc => accountPickerMode !== 'to' || acc.id !== selectedAccount)
                                    .map(acc => (
                                    <button key={acc.id}
                                        onClick={() => {
                                            if (accountPickerMode === 'to') {
                                                setSelectedTargetAccount(acc.id)
                                            } else {
                                                setSelectedAccount(acc.id)
                                                if (selectedTargetAccount === acc.id) {
                                                    setSelectedTargetAccount(null)
                                                }
                                            }
                                            setShowAccountPicker(false)
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                                            (accountPickerMode === 'to' ? selectedTargetAccount : selectedAccount) === acc.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="font-medium">{acc.name}</span>
                                        <span className="text-sm tabular-nums">{formatIDR(acc.balance)}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Picker */}
            <AnimatePresence>
                {showCategoryPicker && type !== 'transfer' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 z-50 flex items-end"
                        onClick={() => setShowCategoryPicker(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="font-bold text-text-primary mb-4">Pilih Kategori</h3>
                            <div className="space-y-1">
                                {(type === 'income' ? incomeCategories : budgetCategories).map(cat => (
                                    <button key={cat.id}
                                        onClick={() => { setSelectedCategory(cat.id); setShowCategoryPicker(false) }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedCategory === cat.id ? 'bg-primary/10' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="material-icons-round text-text-secondary">{cat.icon}</span>
                                        <div className="text-left">
                                            <p className="font-medium text-text-primary text-sm">{cat.name}</p>
                                            <p className="text-xs text-text-secondary">{cat.group}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
