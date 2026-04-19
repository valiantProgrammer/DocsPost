import { MongoClient, ObjectId } from "mongodb";

export async function DELETE(req) {
    let client;
    try {
        const { documentId } = await req.json();

        if (!documentId) {
            return new Response(
                JSON.stringify({ error: "Document ID is required" }),
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

        const result = await docsCollection.deleteOne({
            _id: new ObjectId(documentId),
        });

        if (result.deletedCount === 0) {
            return new Response(
                JSON.stringify({ error: "Document not found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Document deleted successfully",
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting document:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to delete document" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
