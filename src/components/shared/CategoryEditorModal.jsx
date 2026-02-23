import { useEffect, useMemo, useState } from 'react'
import { formatIDR } from '../../utils/format'

const DEFAULT_ICON = 'storefront'

export default function CategoryEditorModal({
    open,
    onClose,
    onSubmit,
    existingGroups = [],
    title = 'Tambah Kategori',
}) {
    const [name, setName] = useState('')
    const [group, setGroup] = useState('')
    const [budgetText, setBudgetText] = useState('0')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!open) return
        setName('')
        setGroup(existingGroups[0] || 'Lainnya')
        setBudgetText('0')
        setIsSaving(false)
    }, [open, existingGroups])

    const budgetValue = useMemo(() => Math.max(0, Number(budgetText) || 0), [budgetText])

    if (!open) return null

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!name.trim()) return

        setIsSaving(true)
        try {
            await onSubmit?.({
                name: name.trim(),
                group: group.trim() || 'Lainnya',
                icon: DEFAULT_ICON,
                budgeted: budgetValue,
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
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Nama Kategori</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Uang Sekolah"
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Grup</span>
                    <input
                        list="category-groups"
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        placeholder="Contoh: Kebutuhan Harian"
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <datalist id="category-groups">
                        {existingGroups.map((g) => (
                            <option key={g} value={g} />
                        ))}
                    </datalist>
                </label>

                <label className="block">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Budget Awal Bulan Ini</span>
                    <input
                        type="number"
                        value={budgetText}
                        onChange={(e) => setBudgetText(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="mt-1 block text-xs text-text-secondary">{formatIDR(budgetValue)}</span>
                </label>

                <button
                    type="submit"
                    disabled={isSaving || !name.trim()}
                    className="w-full bg-primary text-black font-bold rounded-xl py-2.5 disabled:opacity-60"
                >
                    {isSaving ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
            </form>
        </div>
    )
}
