import { MongoClient, ObjectId } from "mongodb";

const parseDocumentBlocks = (document) => {
    if (Array.isArray(document.blocks)) {
        return document.blocks;
    }

    if (typeof document.content === "string" && document.content.trim()) {
        try {
            const parsed = JSON.parse(document.content);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch {
            return [{ id: "legacy-1", type: "paragraph", content: document.content }];
        }

        return [{ id: "legacy-1", type: "paragraph", content: document.content }];
    }

    return [];
};

export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const documentId = searchParams.get("documentId");
        const userEmail = searchParams.get("userEmail") || "";

        if (!slug && !documentId) {
            return new Response(JSON.stringify({ error: "Document slug or id is required" }), {
                status: 400,
            });
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

        const query = slug ? { slug } : { _id: new ObjectId(documentId), ...(userEmail ? { userEmail } : {}) };

        const document = slug
            ? await docsCollection.findOneAndUpdate(query, { $inc: { views: 1 } }, { returnDocument: "after" })
            : await docsCollection.findOne(query);

        if (!document) {
            return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
        }
        const normalizedBlocks = parseDocumentBlocks(document);

        let authorUsername = "";
        if (document.userEmail) {
            try {
                const usersCollection = db.collection("users");
                const author = await usersCollection.findOne({ email: document.userEmail });
                authorUsername = author?.username || document.userEmail;
            } catch (err) {
                console.error("Error fetching author:", err);
                authorUsername = document.userEmail;
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                document: {
                    _id: document._id.toString(),
                    title: document.title,
                    description: document.description,
                    content: document.content,
                    blocks: normalizedBlocks,
                    category: document.category,
                    difficulty: document.difficulty,
                    slug: document.slug,
                    views: document.views || 0,
                    userEmail: document.userEmail,
                    authorUsername,
                    createdAt: document.createdAt,
                    updatedAt: document.updatedAt,
                    status: document.status || (document.published ? "Published" : "Draft"),
                    visibility: document.visibility || "Public",
                    tags: document.tags || [],
                    featuredImage: document.featuredImage || "",
                },
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching document:", error);
        return new Response(JSON.stringify({ error: error.message || "Failed to fetch document" }), {
            status: 500,
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
