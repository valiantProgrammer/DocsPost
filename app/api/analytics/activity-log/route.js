import { MongoClient } from "mongodb";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get("email");

        if (!userEmail) {
            return new Response(
                JSON.stringify({ error: "Email is required" }),
                { status: 400 }
            );
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const analyticsCollection = db.collection("analytics");
        const now = new Date();

        // Get last 365 days of activity
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        // Get daily activity count
        const activityLog = await analyticsCollection
            .aggregate([
                {
                    $match: {
                        userEmail,
                        timestamp: { $gte: oneYearAgo },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                        },
                        count: { $sum: 1 },
                        views: {
                            $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] },
                        },
                        votes: {
                            $sum: { $cond: [{ $eq: ["$type", "vote"] }, 1, 0] },
                        },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ])
            .toArray();

        // Get statistics
        const totalStats = await analyticsCollection
            .aggregate([
                {
                    $match: {
                        userEmail,
                        timestamp: { $gte: oneYearAgo },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalViews: {
                            $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] },
                        },
                        totalVotes: {
                            $sum: { $cond: [{ $eq: ["$type", "vote"] }, 1, 0] },
                        },
                        totalLikes: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$type", "vote"] },
                                            { $eq: ["$voteType", "like"] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        activeDays: { $addToSet: "$date" },
                    },
                },
            ])
            .toArray();

        // Get today's activity
        const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const todayActivity = await analyticsCollection.countDocuments({
            userEmail,
            timestamp: { $gte: todayStart, $lt: todayEnd },
        });

        await client.close();

        return new Response(
            JSON.stringify({
                success: true,
                activityLog,
                stats: {
                    totalViews: totalStats[0]?.totalViews || 0,
                    totalVotes: totalStats[0]?.totalVotes || 0,
                    totalLikes: totalStats[0]?.totalLikes || 0,
                    activeDays: totalStats[0]?.activeDays?.length || 0,
                    todayActivity,
                },
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching activity log:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
