import { db } from './dbConfig'
import { Notifications, Reports, Rewards, Transactions, Users } from './schema'
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





// getRewardTransactions

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


// markNotificationAsRead

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




// createReport

export async function createReport(
    userId: number,
    location: string,
    wasteType: string,
    amount: string,
    imageUrl?: string,
    type?: string,
    verificationResult?: any
) {
    try {
        const [report] = await db
            .insert(Reports)
            .values({
                userId,
                location,
                collectorId: userId,
                wasteType,
                amount,
                imageUrl,
                verificationResult,
                status: "pending",
            })
            .returning()
            .execute();

        // Award 10 points for reporting waste
        const pointsEarned = 10;
        await updateRewardPoints(userId, pointsEarned);

        // Create a transaction for the earned points
        await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

        // Create a notification for the user
        await createNotification(
            userId,
            `You've earned ${pointsEarned} points for reporting waste!`,
            'reward'
        );

        return report;
    } catch (error) {
        console.error("Error creating report:", error);
        return null;
    }
}



// updateRewardPoints

export async function updateRewardPoints(userId: number, pointsToAdd: number) {
    try {
        const [updateReward] = await db
            .update(Rewards)
            .set({
                points: sql`${Rewards.points} + ${pointsToAdd}`
            })
            .where(eq(Rewards.userId, userId))
            .returning()
            .execute()

        return updateReward
    } catch (error) {
        console.error('Error updating reward points', error)
        return null
    }
}


// createTransaction
export async function createTransaction(
    userId: number,
    type: 'earned_report' | 'earned_collect' | 'redeemed',
    amount: number,
    description: string
) {
    try {
        const [transaction] = await db
            .insert(Transactions)
            .values({
                userId,
                type,
                amount,
                description
            })
            .returning()
            .execute()

        return transaction

    } catch (error) {
        console.error('Error creating transaction', error)
        return null
    }
}


// createNotification
export async function createNotification(
    userId: number,
    message: string,
    type: string,
) {
    try {
        const [notification] = await db
            .insert(Notifications)
            .values({
                userId,
                message,
                type
            })
            .returning()
            .execute()

        return notification
    } catch (error) {
        console.error('Error creating notification', error)
        return null
    }
}


// getRecentReports
export async function getRecentReports(
    limit: number = 10
) {

    console.log("hello")
    try {
        const reports = await db
            .select()
            .from(Reports)
            .orderBy(desc(Reports.createdAt))
            .limit(limit)
            .execute()

        console.log("Fetched reports:", reports) // Add this line
        return reports

    } catch (error) {
        console.error("Error fetching recent reports", error)
        return null
    }
}


// getAvailableRewards
export const getAvailableRewards = async (userId: number) => {
    try {
        const userTransactions = await getRewardTransactions(userId) as any
        const userPoints = userTransactions?.reduce((total: any, transaction: any) => {
            return transaction.type.startsWith('earned')
                ? total + transaction.amount
                : total - transaction.amount
        }, 0 // accumulator
        )

        const dbRewards = await db
            .select({
                id: Rewards.id,
                name: Rewards.name,
                cost: Rewards.points,
                description: Rewards.description,
                collectionInfo: Rewards.collectionInfo,
            })
            .from(Rewards)
            .where(eq(Rewards.isAvailable, true))
            .execute();

        console.log('Rewards from database:', dbRewards);

        // Combine user points and database rewards
        const allRewards = [
            {
                id: 0, // Use a special ID for user's points
                name: "Your Points",
                cost: userPoints,
                description: "Redeem your earned points",
                collectionInfo: "Points earned from reporting and collecting waste"
            },
            ...dbRewards
        ];

        console.log('All available rewards:', allRewards);
        return allRewards;


    } catch (error) {
        console.error("Error fetching available rewards:", error);
        return [];
    }
}


// getWasteCollectionTasks
export const getWasteCollectionTasks = async () => {
    try {
        
    } catch (error) {
        
    }
}