import { MongoClient } from "mongodb";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get("email");
        const timeframe = searchParams.get("timeframe") || "daily"; // quarterly, daily, monthly, yearly

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

        // IST = UTC + 5:30 hours = 19800000 milliseconds
        const IST_OFFSET = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5.5 hours in ms

        if (timeframe === "quarterly") {
            // Last 7 hours (15-minute intervals)
            // Round to nearest 15-minute boundary using timestamp math
            startDate = new Date(now.getTime() - 7 * 60 * 60 * 1000);
            groupBy = {
                $dateToString: {
                    format: "%Y-%m-%d %H:%M",
                    timezone: "Asia/Kolkata",  // India Standard Time
                    date: {
                        $toDate: {
                            $multiply: [
                                { $floor: { $divide: [{ $toLong: "$timestamp" }, 15 * 60 * 1000] } },
                                15 * 60 * 1000
                            ]
                        }
                    }
                }
            };
        } else if (timeframe === "yearly") {
            startDate = new Date(now.getFullYear() - 20, 0, 1);
            groupBy = {
                $dateToString: {
                    format: "%Y",
                    timezone: "Asia/Kolkata",
                    date: "$timestamp"
                }
            };
        } else if (timeframe === "monthly") {
            // Last 36 months
            startDate = new Date(now.getFullYear(), now.getMonth() - 36, 1);
            groupBy = {
                $dateToString: {
                    format: "%Y-%m",
                    timezone: "Asia/Kolkata",
                    date: "$timestamp"
                }
            };
        } else {
            // Last 30 days (daily)
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            groupBy = {
                $dateToString: {
                    format: "%Y-%m-%d",
                    timezone: "Asia/Kolkata",
                    date: "$timestamp"
                }
            };
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

        if (timeframe === "quarterly") {
            console.log(`[API Debug] Timeframe: ${timeframe}`);
            console.log(`  StartDate: ${startDate.toISOString()}`);
            console.log(`  UserEmail: ${userEmail}`);
            console.log(`  Records returned: ${viewStats.length}`);
            console.log(`  Data:`, viewStats);
        }

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
