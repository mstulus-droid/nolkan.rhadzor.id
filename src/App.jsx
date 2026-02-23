import { useEffect } from 'react'
import { useViewDetector } from './hooks/useViewDetector'
import MobileLayout from './layouts/MobileLayout'
import WebLayout from './layouts/WebLayout'
import useBudgetStore from './stores/budgetStore'

export default function App() {
    const { isMobile } = useViewDetector()
    const { loadData, isLoading } = useBudgetStore()

    useEffect(() => {
        loadData()

        // Safety timeout to prevent indefinite loading
        const timeout = setTimeout(() => {
            if (useBudgetStore.getState().isLoading) {
                console.warn('App: Loading timed out after 10s. Forcing UI...')
                useBudgetStore.setState({ isLoading: false })
            }
        }, 10000)

        return () => clearTimeout(timeout)
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-fab animate-pulse-soft">
                        <span className="material-icons-round text-black text-3xl">track_changes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-text-secondary">Memuat Nolkan...</span>
                    </div>
                    <button
                        onClick={() => useBudgetStore.setState({ isLoading: false })}
                        className="text-[10px] text-text-secondary opacity-50 mt-4 underline"
                    >
                        Bypass Loading (Debug)
                    </button>
                </div>
            </div>
        )
    }

    return isMobile ? <MobileLayout /> : <WebLayout />
}
