import { create } from 'zustand'
import { db, getCurrentMonth, seedInitialData } from '../db/db'

const monthFromDate = (dateStr) => dateStr?.slice(0, 7) || ''
const isMonthLTE = (leftMonth, rightMonth) => Boolean(leftMonth) && Boolean(rightMonth) && leftMonth <= rightMonth
const normalizeAccountInput = (accountData) => {
    const balance = Number(accountData.balance ?? 0) || 0
    const hasCustomCleared = Object.prototype.hasOwnProperty.call(accountData, 'cleared')
    const hasCustomUncleared = Object.prototype.hasOwnProperty.call(accountData, 'uncleared')

    return {
        name: accountData.name?.trim() || 'Akun Baru',
        type: accountData.type || 'checking',
        balance,
        cleared: hasCustomCleared ? (Number(accountData.cleared) || 0) : balance,
        uncleared: hasCustomUncleared ? (Number(accountData.uncleared) || 0) : 0,
        icon: accountData.icon || 'account_balance',
        color: accountData.color || '#3b82f6',
        inBudget: accountData.inBudget !== false,
    }
}

const useBudgetStore = create((set, get) => ({
    // State
    currentMonth: getCurrentMonth(),
    accounts: [],
    categories: [],
    transactions: [],
    budgets: [],
    isLoading: true,

    // Computed helpers
    getBudgetAccountIds: () => new Set(get().accounts.filter(a => a.inBudget).map(a => a.id)),
    isBudgetAccount: (accountId) => get().getBudgetAccountIds().has(accountId),
    getAccountById: (id) => get().accounts.find(a => a.id === id),
    getCategoryById: (id) => get().categories.find(c => c.id === id),

    getBudgetForCategory: (categoryId, month) => {
        const m = month || get().currentMonth
        return get().budgets.find(b => b.categoryId === categoryId && b.month === m)
    },

    // Total income for month (transactions with type=income)
    getTotalIncome: (month) => {
        const m = month || get().currentMonth
        const monthTxns = get().transactions.filter(t => {
            return t.date.startsWith(m) && t.type === 'income' && get().isBudgetAccount(t.accountId)
        })
        return monthTxns.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    },

    // Total budgeted for month
    getTotalBudgeted: (month) => {
        const m = month || get().currentMonth
        return get().budgets
            .filter(b => b.month === m)
            .reduce((sum, b) => sum + (b.budgeted || 0), 0)
    },

    // Activity (spending) for a category in a month
    getCategoryActivity: (categoryId, month) => {
        const m = month || get().currentMonth
        return get().transactions
            .filter(t => (
                t.categoryId === categoryId &&
                t.date.startsWith(m) &&
                t.type === 'expense' &&
                get().isBudgetAccount(t.accountId)
            ))
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    },

    // Activity until month end (for rollover behavior)
    getCategoryActivityToMonth: (categoryId, month) => {
        const m = month || get().currentMonth
        return get().transactions
            .filter(t => (
                t.categoryId === categoryId &&
                t.type === 'expense' &&
                get().isBudgetAccount(t.accountId) &&
                isMonthLTE(monthFromDate(t.date), m)
            ))
            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    },

    // Budgeted until month end
    getCategoryBudgetedToMonth: (categoryId, month) => {
        const m = month || get().currentMonth
        return get().budgets
            .filter(b => b.categoryId === categoryId && isMonthLTE(b.month, m))
            .reduce((sum, b) => sum + (b.budgeted || 0), 0)
    },

    // Available includes rollover from previous months
    getCategoryAvailable: (categoryId, month) => {
        const m = month || get().currentMonth
        const budgetedToMonth = get().getCategoryBudgetedToMonth(categoryId, m)
        const activityToMonth = get().getCategoryActivityToMonth(categoryId, m)
        return budgetedToMonth - activityToMonth
    },

    // Get all unique category groups
    getCategoryGroups: () => {
        const groups = {}
        get().categories.forEach(cat => {
            if (!groups[cat.group]) groups[cat.group] = []
            groups[cat.group].push(cat)
        })
        return groups
    },

    // Total balance across all budget accounts
    getTotalBalance: () => {
        return get().accounts
            .filter(a => a.inBudget)
            .reduce((sum, a) => sum + a.balance, 0)
    },

    // Total envelope funds in all non-income categories
    getTotalAvailable: (month) => {
        const m = month || get().currentMonth
        return get().categories
            .filter(c => c.group !== 'Pemasukan')
            .reduce((sum, c) => sum + get().getCategoryAvailable(c.id, m), 0)
    },

    // To Be Budgeted = cash in budget accounts - allocated envelope funds
    getToBeBudgeted: (month) => {
        const m = month || get().currentMonth
        return get().getTotalBalance() - get().getTotalAvailable(m)
    },

    // Net worth
    getNetWorth: () => {
        return get().accounts.reduce((sum, a) => sum + a.balance, 0)
    },

    // Transactions grouped by date
    getTransactionsByDate: (accountId) => {
        let txns = [...get().transactions]
        if (accountId) txns = txns.filter(t => t.accountId === accountId)
        txns.sort((a, b) => new Date(b.date) - new Date(a.date))

        const groups = {}
        txns.forEach(t => {
            if (!groups[t.date]) groups[t.date] = []
            groups[t.date].push(t)
        })
        return groups
    },

    // Actions
    setMonth: (month) => set({ currentMonth: month }),

    loadData: async () => {
        console.log('budgetStore: starting loadData')
        try {
            console.log('budgetStore: seeding initial data')
            await seedInitialData()
            console.log('budgetStore: seeding done, fetching tables')
            const [accounts, categories, transactions, budgets] = await Promise.all([
                db.accounts.toArray(),
                db.categories.orderBy('sortOrder').toArray(),
                db.transactions.orderBy('date').reverse().toArray(),
                db.budgets.toArray(),
            ])
            console.log('budgetStore: data fetched, updating state')
            set({ accounts, categories, transactions, budgets, isLoading: false })
            console.log('budgetStore: loadData complete')
        } catch (error) {
            console.error('budgetStore: loadData error', error)
            set({ isLoading: false })
        }
    },

    addTransaction: async (txnData) => {
        if (!txnData?.accountId) {
            throw new Error('Account wajib diisi')
        }

        if (txnData.type === 'transfer') {
            const sourceAccountId = txnData.accountId
            const targetAccountId = txnData.targetAccountId
            const transferAmount = Math.abs(Number(txnData.amount) || 0)
            const date = txnData.date || new Date().toISOString().split('T')[0]
            const now = new Date().toISOString()

            if (!targetAccountId || sourceAccountId === targetAccountId || transferAmount === 0) {
                throw new Error('Transfer butuh akun tujuan dan nominal valid')
            }

            let sourceTxnId
            await db.transaction('rw', db.transactions, db.accounts, async () => {
                const sourceAccount = await db.accounts.get(sourceAccountId)
                const targetAccount = await db.accounts.get(targetAccountId)

                if (!sourceAccount || !targetAccount) {
                    throw new Error('Akun transfer tidak ditemukan')
                }

                const cleared = Boolean(txnData.cleared)
                const sourcePayee = txnData.payee || `Transfer ke ${targetAccount.name}`
                const targetPayee = txnData.payee || `Transfer dari ${sourceAccount.name}`

                sourceTxnId = await db.transactions.add({
                    date,
                    payee: sourcePayee,
                    accountId: sourceAccountId,
                    transferAccountId: targetAccountId,
                    transferPairId: null,
                    categoryId: null,
                    amount: -transferAmount,
                    type: 'transfer',
                    note: txnData.note || '',
                    cleared,
                    createdAt: now,
                })

                const targetTxnId = await db.transactions.add({
                    date,
                    payee: targetPayee,
                    accountId: targetAccountId,
                    transferAccountId: sourceAccountId,
                    transferPairId: sourceTxnId,
                    categoryId: null,
                    amount: transferAmount,
                    type: 'transfer',
                    note: txnData.note || '',
                    cleared,
                    createdAt: now,
                })

                await db.transactions.update(sourceTxnId, { transferPairId: targetTxnId })

                await db.accounts.update(sourceAccountId, {
                    balance: (sourceAccount.balance || 0) - transferAmount,
                    cleared: (sourceAccount.cleared || 0) + (cleared ? -transferAmount : 0),
                    uncleared: (sourceAccount.uncleared || 0) + (cleared ? 0 : -transferAmount),
                })

                await db.accounts.update(targetAccountId, {
                    balance: (targetAccount.balance || 0) + transferAmount,
                    cleared: (targetAccount.cleared || 0) + (cleared ? transferAmount : 0),
                    uncleared: (targetAccount.uncleared || 0) + (cleared ? 0 : transferAmount),
                })
            })

            await get().loadData()
            return sourceTxnId
        }

        const rawAmount = Number(txnData.amount) || 0
        if (rawAmount === 0) return null

        const normalizedAmount = txnData.type === 'expense'
            ? -Math.abs(rawAmount)
            : txnData.type === 'income'
                ? Math.abs(rawAmount)
                : rawAmount

        let id
        await db.transaction('rw', db.transactions, db.accounts, async () => {
            id = await db.transactions.add({
                ...txnData,
                categoryId: txnData.categoryId || null,
                amount: normalizedAmount,
                createdAt: new Date().toISOString(),
            })

            const account = await db.accounts.get(txnData.accountId)
            if (account) {
                await db.accounts.update(txnData.accountId, {
                    balance: (account.balance || 0) + normalizedAmount,
                    cleared: (account.cleared || 0) + (txnData.cleared ? normalizedAmount : 0),
                    uncleared: (account.uncleared || 0) + (txnData.cleared ? 0 : normalizedAmount),
                })
            }
        })

        await get().loadData()
        return id
    },

    allocateFunds: async (categoryId, amount, month) => {
        const m = month || get().currentMonth
        const existing = get().getBudgetForCategory(categoryId, m)

        if (existing) {
            await db.budgets.update(existing.id, { budgeted: amount })
        } else {
            await db.budgets.add({ month: m, categoryId, budgeted: amount })
        }

        const budgets = await db.budgets.toArray()
        set({ budgets })
    },

    moveMoney: async (fromCategoryId, toCategoryId, amount, month) => {
        const m = month || get().currentMonth
        const fromBudget = get().getBudgetForCategory(fromCategoryId, m)
        const toBudget = get().getBudgetForCategory(toCategoryId, m)

        if (fromBudget) {
            await db.budgets.update(fromBudget.id, { budgeted: (fromBudget.budgeted || 0) - amount })
        }
        if (toBudget) {
            await db.budgets.update(toBudget.id, { budgeted: (toBudget.budgeted || 0) + amount })
        } else {
            await db.budgets.add({ month: m, categoryId: toCategoryId, budgeted: amount })
        }

        const budgets = await db.budgets.toArray()
        set({ budgets })
    },

    addAccount: async (accountData) => {
        const payload = normalizeAccountInput(accountData)
        await db.accounts.add({ ...payload, createdAt: new Date().toISOString() })
        const accounts = await db.accounts.toArray()
        set({ accounts })
    },

    updateAccount: async (id, updates) => {
        const account = await db.accounts.get(id)
        if (!account) return

        const merged = { ...account, ...updates }
        const normalized = normalizeAccountInput(merged)
        await db.accounts.update(id, { ...normalized, updatedAt: new Date().toISOString() })
        const accounts = await db.accounts.toArray()
        set({ accounts })
    },

    addCategory: async (categoryData) => {
        await db.categories.add(categoryData)
        const categories = await db.categories.orderBy('sortOrder').toArray()
        set({ categories })
    },

    updateTransaction: async (id, updates) => {
        await db.transactions.update(id, { ...updates, updatedAt: new Date().toISOString() })
        await get().loadData()
    },

    deleteTransaction: async (id) => {
        const txn = get().transactions.find(t => t.id === id)
        if (!txn) return

        const reverseAccountEffect = async (transaction) => {
            const account = await db.accounts.get(transaction.accountId)
            if (!account) return
            await db.accounts.update(transaction.accountId, {
                balance: (account.balance || 0) - transaction.amount,
                cleared: (account.cleared || 0) - (transaction.cleared ? transaction.amount : 0),
                uncleared: (account.uncleared || 0) - (transaction.cleared ? 0 : transaction.amount),
            })
        }

        await db.transaction('rw', db.transactions, db.accounts, async () => {
            if (txn.type === 'transfer' && txn.transferPairId) {
                const pairTxn = await db.transactions.get(txn.transferPairId)
                if (pairTxn) {
                    await reverseAccountEffect(pairTxn)
                    await db.transactions.delete(pairTxn.id)
                }
            }

            await reverseAccountEffect(txn)
            await db.transactions.delete(id)
        })

        await get().loadData()
    },
}))

export default useBudgetStore
