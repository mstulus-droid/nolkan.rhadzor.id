import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/web/Sidebar'
import NolkanBudgetPage from '../pages/web/NolkanBudgetPage'
import AkunListPage from '../pages/web/AkunListPage'
import AkunDetailPage from '../pages/web/AkunDetailPage'
import LaporanPage from '../pages/LaporanPage'
import SettingsPage from '../pages/SettingsPage'

export default function WebLayout() {
    return (
        <div className="flex h-screen bg-background-light overflow-hidden">
            <Sidebar />
            {/* Main content with sidebar offset */}
            <main className="ml-64 flex-1 overflow-y-auto no-scrollbar">
                <Routes>
                    <Route path="/" element={<NolkanBudgetPage />} />
                    <Route path="/akun" element={<AkunListPage />} />
                    <Route path="/akun/:id" element={<AkunDetailPage />} />
                    <Route path="/laporan" element={<LaporanPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    {/* Redirect mobile-only routes to budget */}
                    <Route path="/transaksi/baru" element={<NolkanBudgetPage />} />
                    <Route path="/budget" element={<NolkanBudgetPage />} />
                </Routes>
            </main>
        </div>
    )
}
