import { NavLink, useNavigate } from 'react-router-dom'
import useBudgetStore from '../../stores/budgetStore'
import AccountCard from '../shared/AccountCard'
import { formatIDR } from '../../utils/format'

const NAV_ITEMS = [
    { to: '/', icon: 'track_changes', label: 'Nolkan Budget', exact: true },
    { to: '/akun', icon: 'account_balance_wallet', label: 'Semua Akun' },
    { to: '/laporan', icon: 'bar_chart', label: 'Laporan' },
    { to: '/settings', icon: 'settings', label: 'Setelan' },
]

export default function Sidebar() {
    const navigate = useNavigate()
    const { accounts, getToBeBudgeted, currentMonth } = useBudgetStore()
    const tbb = getToBeBudgeted()
    const budgetAccounts = accounts.filter(a => a.inBudget)

    return (
        <aside className="w-64 fixed left-0 top-0 h-full bg-sidebar-bg border-r border-gray-200/60 flex flex-col shadow-sidebar z-30">
            {/* Logo */}
            <div className="px-5 pt-8 pb-5 border-b border-gray-200/60">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-fab">
                        <span className="material-icons-round text-black text-xl">track_changes</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-text-primary uppercase">Nolkan</span>
                </div>
                {/* TBB indicator */}
                <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Tersedia Dinolkan</p>
                    <p className={`text-lg font-bold tabular-nums ${tbb < 0 ? 'text-danger' : tbb === 0 ? 'text-text-secondary' : 'text-gold'}`}>
                        {formatIDR(tbb)}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-4 space-y-0.5">
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all sidebar-item ${isActive
                                ? 'bg-primary/15 text-primary font-semibold'
                                : 'text-text-secondary hover:text-text-primary'
                            }`
                        }
                    >
                        <span className="material-icons-round text-xl">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Accounts list */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
                <div className="px-2 mb-2 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Dalam Budget</h3>
                    <div className="h-px flex-1 bg-gray-200 ml-2" />
                </div>
                <div className="space-y-0.5">
                    {budgetAccounts.map(acc => (
                        <AccountCard key={acc.id} account={acc} compact onClick={(a) => navigate(`/akun/${a.id}`)} />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200/60">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-icons-round text-primary text-sm">person</span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-text-primary">Pengguna</p>
                        <p className="text-[10px] text-text-secondary">Nolkan v1.0</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
