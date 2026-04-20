import { MongoClient } from "mongodb";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get("email");
        const timeframe = searchParams.get("timeframe") || "daily"; // hourly, daily, monthly, yearly

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

        // Get date range based on timeframe
        let startDate;
        let groupBy;

        if (timeframe === "hourly") {
            // Last 7 hours
            startDate = new Date(now.getTime() - 7 * 60 * 60 * 1000);
            groupBy = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$timestamp" } };
        } else if (timeframe === "yearly") {
            // Last 7 years
            startDate = new Date(now.getFullYear() - 7, 0, 1);
            groupBy = { $dateToString: { format: "%Y", date: "$timestamp" } };
        } else if (timeframe === "monthly") {
            // Last 10 months
            startDate = new Date(now.getFullYear(), now.getMonth() - 10, 1);
            groupBy = { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
        } else {
            // Last 7 days (daily)
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
        }

        // Aggregate views by time period
        const viewStats = await analyticsCollection
            .aggregate([
                {
                    $match: {
                        userEmail,
                        type: "view",
                        timestamp: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: groupBy,
                        views: { $sum: 1 },
                        articles: { $addToSet: "$articleId" },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ])
            .toArray();

        // Aggregate votes by time period
        const voteStats = await analyticsCollection
            .aggregate([
                {
                    $match: {
                        userEmail,
                        type: "vote",
                        timestamp: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: { date: groupBy, voteType: "$voteType" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { "_id.date": 1 },
                },
            ])
            .toArray();

        // Get article-wise stats
        const articleStats = await analyticsCollection
            .aggregate([
                {
                    $match: {
                        userEmail,
                        timestamp: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: "$articleId",
                        title: { $first: "$articleTitle" },
                        views: {
                            $sum: { $cond: [{ $eq: ["$type", "view"] }, 1, 0] },
                        },
                        likes: {
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
                        dislikes: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$type", "vote"] },
                                            { $eq: ["$voteType", "dislike"] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
                {
                    $sort: { views: -1 },
                },
            ])
            .toArray();

        await client.close();

        return new Response(
            JSON.stringify({
                success: true,
                timeframe,
                viewStats,
                voteStats,
                articleStats,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
