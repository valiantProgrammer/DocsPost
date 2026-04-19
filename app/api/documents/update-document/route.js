import { MongoClient, ObjectId } from "mongodb";

export async function PUT(req) {
    let client;
    try {
        const { documentId, title, description, content, category, difficulty, userEmail } =
            await req.json();

        if (!documentId || !title || !description) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400 }
            );
        }

        if (!process.env.MONGODB_URI) {
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500 }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const docsCollection = db.collection("user_documents");

        // Generate new slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const result = await docsCollection.updateOne(
            { _id: new ObjectId(documentId), userEmail },
            {
                $set: {
                    title,
                    description,
                    content: content || "",
                    category: category || "Other",
                    difficulty: difficulty || "Beginner",
                    slug,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return new Response(
                JSON.stringify({ error: "Document not found or unauthorized" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Document updated successfully",
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating document:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to update document" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
