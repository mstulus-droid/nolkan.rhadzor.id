import useBudgetStore from '../stores/budgetStore'
import { formatIDR } from '../utils/format'

export default function SettingsPage() {
    const { accounts, categories } = useBudgetStore()

    return (
        <div className="min-h-full px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-text-primary mb-6">Setelan</h1>

            <div className="space-y-6 max-w-2xl">
                {/* App info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-text-primary">Tentang Nolkan</h2>
                    </div>
                    <div className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-fab">
                            <span className="material-icons-round text-black text-3xl">track_changes</span>
                        </div>
                        <div>
                            <p className="font-bold text-text-primary text-lg">Nolkan</p>
                            <p className="text-sm text-text-secondary">Budget Cerdas YNAB-Style</p>
                            <p className="text-xs text-text-secondary mt-0.5">Versi 1.0.0 - PWA</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-bold text-text-primary">Data</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-text-secondary">Jumlah Akun</span>
                            <span className="text-sm font-bold text-text-primary">{accounts.length}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-text-secondary">Jumlah Kategori</span>
                            <span className="text-sm font-bold text-text-primary">{categories.length}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm text-text-secondary">Penyimpanan</span>
                            <span className="text-sm font-bold text-text-primary">IndexedDB (Offline)</span>
                        </div>
                    </div>
                </div>

                {/* Danger zone */}
                <div className="bg-white rounded-2xl border border-danger/20 shadow-soft overflow-hidden">
                    <div className="px-5 py-4 border-b border-danger/10">
                        <h2 className="font-bold text-danger">Zona Berbahaya</h2>
                    </div>
                    <div className="p-5">
                        <button
                            onClick={() => {
                                if (confirm('Yakin ingin menghapus semua data? Tindakan ini tidak bisa dibatalkan.')) {
                                    indexedDB.deleteDatabase('NolkanDB')
                                    window.location.reload()
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-danger/10 text-danger text-sm font-semibold hover:bg-danger/20 transition-colors"
                        >
                            <span className="material-icons-round text-lg">delete_forever</span>
                            Hapus Semua Data
                        </button>
                        <p className="text-xs text-text-secondary mt-2">Data tersimpan lokal di browser ini. Menghapus data tidak bisa dibatalkan.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
