import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Keypad from '../../components/mobile/Keypad'

export default function KeypadTrxPage() {
    const navigate = useNavigate()

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
        >
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10 safe-top">
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                >
                    <span className="material-icons-round text-xl">close</span>
                </button>
            </div>

            <Keypad onClose={() => navigate(-1)} />
        </motion.div>
    )
}
