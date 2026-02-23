import Dexie from 'dexie'

export const db = new Dexie('NolkanDB')

db.version(1).stores({
    accounts: '++id, name, type',
    categories: '++id, name, group',
    transactions: '++id, date, accountId, categoryId, type',
    budgets: '++id, month, categoryId',
    settings: 'key',
})

// Explicitly open the database and handle errors
db.open().catch(err => {
    console.error('Failed to open NolkanDB:', err.stack || err)
})

db.on('blocked', () => {
    console.warn('Database access is blocked by another tab/process.')
})

// Seed initial data if empty
let isSeeding = false
export async function seedInitialData() {
    if (isSeeding) return
    isSeeding = true
    try {
        console.log('db: checking account count')
        const accountCount = await db.accounts.count()
        console.log('db: account count =', accountCount)
        if (accountCount > 0) return

        console.log('db: seeding new data')

        const now = new Date().toISOString()

        // Accounts
        await db.accounts.bulkAdd([
            { name: 'BCA Tahapan', type: 'checking', balance: 15250000, cleared: 12000000, uncleared: 3250000, icon: 'account_balance', color: '#3b82f6', inBudget: true, createdAt: now },
            { name: 'Jenius Utama', type: 'checking', balance: 4100000, cleared: 4100000, uncleared: 0, icon: 'account_balance_wallet', color: '#8b5cf6', inBudget: true, createdAt: now },
            { name: 'Dompet Tunai', type: 'cash', balance: 450000, cleared: 450000, uncleared: 0, icon: 'wallet', color: '#f59e0b', inBudget: true, createdAt: now },
        ])

        // Category groups & categories
        await db.categories.bulkAdd([
            { name: 'Makan & Minum', group: 'Kebutuhan Harian', icon: 'restaurant', color: '#3b82f6', sortOrder: 1 },
            { name: 'Belanja Bulanan', group: 'Kebutuhan Harian', icon: 'local_grocery_store', color: '#f97316', sortOrder: 2 },
            { name: 'Transportasi', group: 'Kebutuhan Harian', icon: 'directions_bus', color: '#8b5cf6', sortOrder: 3 },
            { name: 'Makanan Kucing', group: 'Kebutuhan Harian', icon: 'pets', color: '#14b8a6', sortOrder: 4 },
            { name: 'Listrik & Air', group: 'Tagihan Tetap', icon: 'lightbulb', color: '#eab308', sortOrder: 5 },
            { name: 'Internet & WiFi', group: 'Tagihan Tetap', icon: 'wifi', color: '#6366f1', sortOrder: 6 },
            { name: 'Sewa Kost', group: 'Tagihan Tetap', icon: 'home', color: '#ef4444', sortOrder: 7 },
            { name: 'Dana Darurat', group: 'Tabungan & Investasi', icon: 'savings', color: '#10b981', sortOrder: 8 },
            { name: 'Liburan Jepang', group: 'Tabungan & Investasi', icon: 'flight', color: '#ec4899', sortOrder: 9 },
            { name: 'Hiburan', group: 'Gaya Hidup', icon: 'movie', color: '#f59e0b', sortOrder: 10 },
            { name: 'Kesehatan', group: 'Gaya Hidup', icon: 'local_hospital', color: '#ef4444', sortOrder: 11 },
            { name: 'Pendapatan', group: 'Pemasukan', icon: 'payments', color: '#0df269', sortOrder: 0 },
        ])

        // Budget allocations for current month
        const month = getCurrentMonth()
        const cats = await db.categories.toArray()
        const budgetData = {
            'Makan & Minum': 2000000,
            'Belanja Bulanan': 1200000,
            'Transportasi': 500000,
            'Makanan Kucing': 0,
            'Listrik & Air': 800000,
            'Internet & WiFi': 350000,
            'Sewa Kost': 1500000,
            'Dana Darurat': 500000,
            'Liburan Jepang': 500000,
            'Hiburan': 200000,
            'Kesehatan': 300000,
        }

        for (const cat of cats) {
            if (budgetData[cat.name] !== undefined) {
                console.log('db: adding budget for', cat.name)
                await db.budgets.add({ month, categoryId: cat.id, budgeted: budgetData[cat.name] })
            }
        }
        console.log('db: budgets added')

        // Sample transactions
        const accounts = await db.accounts.toArray()
        const bcaId = accounts.find(a => a.name === 'BCA Tahapan')?.id
        const dompetId = accounts.find(a => a.name === 'Dompet Tunai')?.id
        const makanCat = cats.find(c => c.name === 'Makan & Minum')?.id
        const transportCat = cats.find(c => c.name === 'Transportasi')?.id
        const hiburanCat = cats.find(c => c.name === 'Hiburan')?.id
        const pendapatanCat = cats.find(c => c.name === 'Pendapatan')?.id
        const belanjacat = cats.find(c => c.name === 'Belanja Bulanan')?.id

        const today = new Date()
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
        const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2)

        await db.transactions.bulkAdd([
            { date: today.toISOString().split('T')[0], payee: 'Makan Siang', accountId: dompetId, categoryId: makanCat, amount: -45000, type: 'expense', note: '', cleared: true, createdAt: now },
            { date: today.toISOString().split('T')[0], payee: 'SPBU Shell', accountId: bcaId, categoryId: transportCat, amount: -350000, type: 'expense', note: '', cleared: true, createdAt: now },
            { date: yesterday.toISOString().split('T')[0], payee: 'Transfer Masuk', accountId: bcaId, categoryId: pendapatanCat, amount: 5000000, type: 'income', note: 'Gaji Februari', cleared: false, createdAt: now },
            { date: yesterday.toISOString().split('T')[0], payee: 'Tokopedia', accountId: bcaId, categoryId: belanjacat, amount: -250000, type: 'expense', note: '', cleared: true, createdAt: now },
            { date: twoDaysAgo.toISOString().split('T')[0], payee: 'XXI Premiere', accountId: dompetId, categoryId: hiburanCat, amount: -150000, type: 'expense', note: '', cleared: true, createdAt: now },
            { date: twoDaysAgo.toISOString().split('T')[0], payee: 'Kopi Kenangan', accountId: dompetId, categoryId: makanCat, amount: -25000, type: 'expense', note: '', cleared: true, createdAt: now },
        ])
        console.log('db: transactions added')
    } catch (error) {
        console.error('db: seeding error', error)
    } finally {
        isSeeding = false
    }
}

export function getCurrentMonth() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
