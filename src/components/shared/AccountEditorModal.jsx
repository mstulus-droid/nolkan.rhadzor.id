import { useEffect, useMemo, useState } from 'react'
import { formatIDR } from '../../utils/format'

const ACCOUNT_TYPES = [
    { value: 'checking', label: 'Tabungan/Bank' },
    { value: 'cash', label: 'Tunai' },
    { value: 'savings', label: 'Simpanan' },
    { value: 'credit', label: 'Kartu Kredit' },
    { value: 'investment', label: 'Investasi' },
]

export default function AccountEditorModal({ open, title, initialAccount, onClose, onSubmit }) {
    const [name, setName] = useState('')
    const [type, setType] = useState('checking')
    const [balanceText, setBalanceText] = useState('0')
    const [inBudget, setInBudget] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!open) return
        setName(initialAccount?.name || '')
        setType(initialAccount?.type || 'checking')
        setBalanceText(String(initialAccount?.balance ?? 0))
        setInBudget(initialAccount?.inBudget !== false)
        setIsSaving(false)
    }, [open, initialAccount])

    const balanceValue = useMemo(() => Number(balanceText) || 0, [balanceText])

    if (!open) return null

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!name.trim()) return

        setIsSaving(true)
        try {
            await onSubmit?.({
                name: name.trim(),
                type,
                balance: balanceValue,
                inBudget,
            })
            onClose?.()
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-0 md:p-4" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-soft border border-gray-100 p-5 space-y-4"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                    <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100">
                        <span className="material-icons-round text-text-secondary text-lg">close</span>
                    </button>
                </div>

                <label className="block">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nama Akun</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: BCA Tahapan"
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tipe</span>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        {ACCOUNT_TYPES.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Saldo Saat Ini</span>
                    <input
                        type="number"
                        value={balanceText}
                        onChange={(e) => setBalanceText(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className={`mt-1 block text-xs ${balanceValue < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                        {formatIDR(balanceValue)}
                    </span>
                </label>

                <label className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5">
                    <div>
                        <p className="text-sm font-semibold text-text-primary">Masuk Budget</p>
                        <p className="text-xs text-text-secondary">Matikan jika ini akun tracking di luar budget</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={inBudget}
                        onChange={(e) => setInBudget(e.target.checked)}
                        className="w-4 h-4 accent-primary"
                    />
                </label>

                <button
                    type="submit"
                    disabled={isSaving || !name.trim()}
                    className="w-full bg-primary text-black font-bold rounded-xl py-2.5 disabled:opacity-60"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
            </form>
        </div>
    )
}
