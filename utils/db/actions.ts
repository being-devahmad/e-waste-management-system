import { db } from './dbConfig'
import { Notifications, Transactions, Users } from './schema'
import { eq, sql, and, desc } from 'drizzle-orm'



// create user
export async function createUser(email: string, name: string) {
    try {
        const [user] = await db.insert(Users).values({ email, name }).returning().execute()
        return user
    } catch (error) {
        console.log("Error creating user", error)
        return null
    }
}


// fetch User by Email
export async function getUserByEmail(email: string) {
    try {
        const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute()
        return user;
    } catch (error) {
        console.log('Error fetching user by email', error)
    }
}


// getUnreadNotifications
export async function getUnreadNotifications(userId: number) {
    try {
        return await db.select()
            .from(Notifications)
            .where(and(eq(Notifications.id, userId), eq(Notifications.isRead, false)))

    } catch (error) {
        console.log('Error fetching unread notifications', error)
        return null
    }
}

// getUserBalance
export async function getUserBalance(userId: number): Promise<number> {
    const transactions = await getRewardTransactions(userId) || []

    if (!transactions) return 0

    const balance = transactions?.reduce((acc: number, transaction: any) => {
        return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
    }, 0)

    return Math.max(balance, 0)
}


export async function getRewardTransactions(userId: number) {
    try {
        const transactions = await db.select({
            id: Transactions.id,
            type: Transactions.type,
            amount: Transactions.amount,
            description: Transactions.description,
            date: Transactions.date
        })
            .from(Transactions)
            .where(eq(Transactions.userId, userId))
            .orderBy(desc(Transactions.date))
            .limit(10)
            .execute()

        const formattedTransactions = transactions.map(t => ({
            ...t,
            date: t.date.toISOString().split('T')[0] // YYYY-MM-DD
        }))

        return formattedTransactions
    } catch (error) {
        console.log('Error fetching reward transactions', error)
        return null
    }
}


export async function markNotificationAsRead(notificationId: number) {
    try {
        await db
            .update(Notifications)
            .set({
                isRead: true
            })
            .where(eq(Notifications.id, notificationId))

    } catch (error) {
        console.log('Error marking notification as read', error)
        return null
    }
}