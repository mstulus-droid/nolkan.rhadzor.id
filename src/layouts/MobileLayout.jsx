import { Routes, Route } from 'react-router-dom'
import BottomNav from '../components/mobile/BottomNav'
import SemualAkunPage from '../pages/mobile/SemualAkunPage'
import DetailAkunPage from '../pages/mobile/DetailAkunPage'
import KeypadTrxPage from '../pages/mobile/KeypadTrxPage'
import BajetPage from '../pages/mobile/BajetPage'
import SettingsPage from '../pages/SettingsPage'
import LaporanPage from '../pages/LaporanPage'

export default function MobileLayout() {
    return (
        <div className="flex flex-col h-screen bg-background-light overflow-hidden">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-hidden relative">
                <Routes>
                    <Route path="/" element={<SemualAkunPage />} />
                    <Route path="/akun/:id" element={<DetailAkunPage />} />
                    <Route path="/transaksi/baru" element={<KeypadTrxPage />} />
                    <Route path="/budget" element={<BajetPage />} />
                    <Route path="/laporan" element={<LaporanPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </div>
            {/* Bottom navigation */}
            <BottomNav />
        </div>
    )
}
