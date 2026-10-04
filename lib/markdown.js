/**
 * lib/markdown.js
 * Provides remark plugin for Obsidian-style callouts:
 * > [!info] What you will learn
 * > - bullet 1
 * > - bullet 2
 * And rehype-sanitize schema for safe rendering.
 */

// Custom remark plugin for Obsidian-style callouts
export function remarkCallouts() {
    return (tree) => {
        if (!tree || !tree.children) return;

        tree.children = tree.children.map((node) => {
            if (node.type !== "blockquote") return node;

            const firstChild = node.children?.[0];
            if (!firstChild || firstChild.type !== "paragraph") return node;

            const firstTextNode = firstChild.children?.[0];
            if (!firstTextNode || firstTextNode.type !== "text") return node;

            const text = firstTextNode.value || "";
            // Match > [!type] Optional Title
            const match = text.match(/^\[!([a-zA-Z0-9_-]+)\][ \t]*(.*)/);
            if (!match) return node;

            const rawType = match[1].toLowerCase();
            const calloutTitle = match[2] || (rawType.charAt(0).toUpperCase() + rawType.slice(1));

            // Map aliases: note -> info, etc.
            let type = "info";
            if (["tip", "success"].includes(rawType)) type = "tip";
            else if (["warning", "warn"].includes(rawType)) type = "warning";
            else if (["danger", "error", "bug"].includes(rawType)) type = "danger";
            else type = "info";

            // Remove the [!type] Title from the first paragraph
            const remainingText = text.replace(/^\[!([a-zA-Z0-9_-]+)\][ \t]*(.*)\n?/, "");
            if (remainingText.trim()) {
                firstTextNode.value = remainingText;
            } else {
                firstChild.children.shift();
                if (firstChild.children.length === 0) {
                    node.children.shift();
                }
            }

            return {
                type: "callout",
                data: {
                    hName: "div",
                    hProperties: {
                        className: `editor-callout editor-callout-${type}`,
                        "data-callout-type": type,
                        "data-callout-title": calloutTitle,
                    },
                },
                children: [
                    {
                        type: "calloutTitle",
                        data: {
                            hName: "div",
                            hProperties: { className: "editor-callout-header" },
                        },
                        children: [
                            {
                                type: "text",
                                value: calloutTitle,
                            },
                        ],
                    },
                    ...node.children,
                ],
            };
        });
    };
}

/**
 * Sanitization schema for rehype-sanitize
 * Allows standard GFM, <u> tags, callout attributes, code block language classes
 */
export const sanitizeSchema = {
    tagNames: [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "span", "div", "blockquote", "pre", "code", "em", "strong", "del", "s", "u",
        "ul", "ol", "li", "hr", "br",
        "table", "thead", "tbody", "tr", "th", "td",
        "a", "img", "iframe", "input", "figure", "figcaption"
    ],
    attributes: {
        "*": ["className", "class", "id", "style", "data-callout-type", "data-callout-title"],
        a: ["href", "title", "target", "rel"],
        img: ["src", "alt", "title", "width", "height"],
        input: ["type", "checked", "disabled"],
        iframe: ["src", "width", "height", "frameBorder", "allow", "allowFullScreen"],
        code: ["className", "class"],
        th: ["align", "colSpan", "rowSpan"],
        td: ["align", "colSpan", "rowSpan"],
    },
    protocols: {
        href: ["http", "https", "mailto"],
        src: ["http", "https", "data"],
    },
};

/**
 * Video host allowlist check
 */
export function isAllowedVideoHost(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        return (
            host === "www.youtube.com" ||
            host === "youtube.com" ||
            host === "youtu.be" ||
            host === "player.vimeo.com" ||
            host === "vimeo.com"
        );
    } catch {
        return false;
    }
}

/**
 * Convert standard YouTube / Vimeo video URLs into embed URLs
 */
export function getEmbedUrl(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        if (host === "youtu.be") {
            const id = parsed.pathname.slice(1);
            return `https://www.youtube.com/embed/${id}`;
        }
        if (host.includes("youtube.com")) {
            const v = parsed.searchParams.get("v");
            if (v) return `https://www.youtube.com/embed/${v}`;
            if (parsed.pathname.startsWith("/embed/")) return url;
        }
        if (host.includes("vimeo.com")) {
            const match = parsed.pathname.match(/\/(\d+)/);
            if (match) return `https://player.vimeo.com/video/${match[1]}`;
        }
        return null;
    } catch {
        return null;
    }
}
