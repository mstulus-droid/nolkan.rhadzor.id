import { NavLink, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
    { to: '/', icon: 'home', label: 'Akun', exact: true },
    { to: '/budget', icon: 'account_balance_wallet', label: 'Budget' },
    { to: '/transaksi/baru', icon: 'add_circle', label: 'Tambah', isAction: true },
    { to: '/laporan', icon: 'bar_chart', label: 'Laporan' },
    { to: '/settings', icon: 'settings', label: 'Setelan' },
]

export default function BottomNav() {
    const navigate = useNavigate()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-up safe-bottom">
            <div className="flex items-center justify-around px-2 h-16">
                {NAV_ITEMS.map((item) => {
                    if (item.isAction) {
                        return (
                            <button
                                key={item.to}
                                onClick={() => navigate(item.to)}
                                className="flex flex-col items-center justify-center -mt-6"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary shadow-fab flex items-center justify-center active:scale-95 transition-transform">
                                    <span className="material-icons-round text-3xl text-black">add</span>
                                </div>
                            </button>
                        )
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[52px] ${isActive ? 'text-primary' : 'text-text-secondary'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`material-icons-round text-2xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}
