import { createHighlighter } from "shiki";

/**
 * Normalizes code strings consistently across Monaco, paste, parse, serialize, and render.
 * - Removes Byte Order Mark (\uFEFF)
 * - Converts CRLF and CR to LF (\n)
 * - Removes at most ONE trailing newline
 * - Does NOT trim, dedent, collapse blank lines, or convert spaces
 */
export function normalizeCode(s) {
    if (typeof s !== "string") return "";
    return s
        .replace(/^\uFEFF/, "")
        .replace(/\r\n?/g, "\n")
        .replace(/\n$/, "");
}

export const docspostDarkTheme = {
    name: "docspost-dark",
    type: "dark",
    colors: {
        "editor.background": "#0F172A",
        "editor.foreground": "#E2E8F0",
    },
    tokenColors: [
        {
            scope: ["comment", "punctuation.definition.comment"],
            settings: { foreground: "#5CC77A", fontStyle: "italic" },
        },
        {
            scope: [
                "keyword",
                "storage.type",
                "storage.modifier",
                "keyword.control",
                "keyword.operator.new",
                "keyword.operator.expression",
                "keyword.operator.assignment",
            ],
            settings: { foreground: "#F59E57" },
        },
        {
            scope: ["string", "punctuation.definition.string", "string.quoted"],
            settings: { foreground: "#7DD87F" },
        },
        {
            scope: [
                "entity.name.function",
                "support.function",
                "meta.function-call",
                "entity.name.tag",
            ],
            settings: { foreground: "#F97362" },
        },
        {
            scope: [
                "meta.decorator",
                "tag.decorator",
                "entity.name.function.decorator",
                "entity.name.type",
                "support.type",
                "support.class",
            ],
            settings: { foreground: "#F97362" },
        },
        {
            scope: ["constant.numeric", "constant.language", "constant.character"],
            settings: { foreground: "#FBBF24" },
        },
        {
            scope: [
                "punctuation",
                "meta.brace",
                "punctuation.separator",
                "punctuation.terminator",
            ],
            settings: { foreground: "#94A3B8" },
        },
        {
            scope: ["variable", "variable.other", "variable.parameter"],
            settings: { foreground: "#E2E8F0" },
        },
    ],
};

let highlighterPromise = null;
const loadedLanguages = new Set(["bash", "shell", "python", "javascript", "typescript", "json"]);

export async function getDocsPostHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: [docspostDarkTheme],
            langs: Array.from(loadedLanguages),
        });
    }
    return highlighterPromise;
}

/**
 * Uses Shiki's token API (codeToTokens) to return an array of lines of tokens.
 * Empty lines return an empty token array [].
 */
export async function highlightCodeToTokens(code, lang = "bash") {
    const cleanCode = normalizeCode(code);
    try {
        const highlighter = await getDocsPostHighlighter();
        const normalizedLang = (lang || "bash").toLowerCase();
        const targetLang =
            normalizedLang === "sh"
                ? "bash"
                : normalizedLang === "js"
                ? "javascript"
                : normalizedLang === "ts"
                ? "typescript"
                : normalizedLang === "py"
                ? "python"
                : normalizedLang === "yml"
                ? "yaml"
                : normalizedLang;

        if (!highlighter.getLoadedLanguages().includes(targetLang)) {
            try {
                await highlighter.loadLanguage(targetLang);
            } catch {
                // language not found in shiki bundled languages, fallback to plaintext
            }
        }

        const validLang = highlighter.getLoadedLanguages().includes(targetLang)
            ? targetLang
            : "plaintext";

        const res = highlighter.codeToTokens(cleanCode, {
            lang: validLang,
            theme: "docspost-dark",
        });
        return res.tokens;
    } catch (err) {
        console.warn("Shiki token generation failed, falling back to raw tokens:", err);
        const lines = cleanCode.split("\n");
        return lines.map((line) => (line.length > 0 ? [{ content: line, color: "#E2E8F0" }] : []));
    }
}

/**
 * Backwards compatible helper for HTML rendering.
 */
export async function highlightCodeWithShiki(code, lang = "bash") {
    const cleanCode = normalizeCode(code);
    try {
        const highlighter = await getDocsPostHighlighter();
        const normalizedLang = (lang || "bash").toLowerCase();
        const targetLang =
            normalizedLang === "sh"
                ? "bash"
                : normalizedLang === "js"
                ? "javascript"
                : normalizedLang === "ts"
                ? "typescript"
                : normalizedLang === "py"
                ? "python"
                : normalizedLang === "yml"
                ? "yaml"
                : normalizedLang;

        if (!highlighter.getLoadedLanguages().includes(targetLang)) {
            try {
                await highlighter.loadLanguage(targetLang);
            } catch {
                // fallback
            }
        }

        const validLang = highlighter.getLoadedLanguages().includes(targetLang)
            ? targetLang
            : "plaintext";

        return highlighter.codeToHtml(cleanCode, {
            lang: validLang,
            theme: "docspost-dark",
        });
    } catch (err) {
        console.warn("Shiki highlighting failed, falling back to raw html:", err);
        return `<pre class="shiki docspost-dark"><code>${escapeHtml(cleanCode)}</code></pre>`;
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
