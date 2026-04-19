export async function POST(req) {
    try {
        const { code, language } = await req.json();

        if (!code || !language) {
            return new Response(
                JSON.stringify({ error: "Code and language are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Check if Judge0 API key is available
        const apiKey = process.env.JUDGE0_API_KEY;
        const apiHost = "judge0-ce.p.rapidapi.com";

        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    error: "Code execution service not configured. Please contact administrator.",
                }),
                { status: 503, headers: { "Content-Type": "application/json" } }
            );
        }

        try {
            // Use Judge0 API for code execution
            const judge0Response = await fetch(
                "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "X-RapidAPI-Key": apiKey,
                        "X-RapidAPI-Host": apiHost,
                    },
                    body: JSON.stringify({
                        source_code: code,
                        language_id: getLanguageId(language),
                        stdin: "",
                    }),
                }
            );

            if (!judge0Response.ok) {
                throw new Error("Failed to connect to execution service");
            }

            const result = await judge0Response.json();
            const output =
                result.stdout ||
                result.stderr ||
                result.compile_output ||
                "Code executed successfully (no output)";

            return new Response(
                JSON.stringify({ success: true, output: output.trim() || "Code executed" }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } catch (apiError) {
            console.error("Judge0 API Error:", apiError);
            return new Response(
                JSON.stringify({
                    error: `Execution failed: ${apiError.message}`,
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        console.error("Error executing code:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to execute code" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

function getLanguageId(language) {
    const languageMap = {
        javascript: 63,
        js: 63,
        python: 71,
        python3: 71,
        cpp: 54,
        c: 50,
        java: 62,
        csharp: 51,
        php: 68,
        ruby: 72,
        go: 60,
        rust: 73,
        kotlin: 78,
        swift: 83,
        bash: 46,
        sh: 46,
        sql: 95,
    };
    return languageMap[language.toLowerCase()] || 71; // Default to Python
}
