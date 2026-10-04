import sanitizeHtml from "sanitize-html";

/**
 * Server-side HTML sanitizer for DocsPost documents.
 * Ensures only safe tags, attributes, styles, and protocols are stored.
 */
export function sanitizeDocumentHtml(dirtyHtml) {
    if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

    return sanitizeHtml(dirtyHtml, {
        allowedTags: [
            "h1", "h2", "h3", "h4", "h5", "h6",
            "p", "span", "div", "blockquote", "pre", "code",
            "b", "i", "strong", "em", "strike", "s", "u", "sub", "sup",
            "ul", "ol", "li", "hr", "br",
            "table", "thead", "tbody", "tfoot", "tr", "th", "td",
            "a", "img", "iframe",
            // Task list tags
            "label", "input"
        ],
        allowedAttributes: {
            "*": ["style", "class", "id", "data-*"],
            "a": ["href", "name", "target", "rel", "title"],
            "img": ["src", "alt", "title", "width", "height", "data-align"],
            "iframe": ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
            "input": ["type", "checked", "disabled"],
            "th": ["colspan", "rowspan", "style"],
            "td": ["colspan", "rowspan", "style"],
        },
        allowedStyles: {
            "*": {
                // Formatting styles
                "font-family": [/^[\w\s,"'-]+$/],
                "font-size": [/^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/],
                "font-weight": [/^\w+$/],
                "color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i, /^rgba\(/i, /^hsl\(/i, /^[a-z]+$/i],
                "background-color": [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i, /^rgba\(/i, /^hsl\(/i, /^[a-z]+$/i],
                "text-align": [/^(left|right|center|justify)$/],
                "line-height": [/^\d+(?:\.\d+)?(?:px|em|rem|%)?$/],
                "margin-left": [/^-?\d+(?:\.\d+)?(?:px|pt|em|rem)$/],
                "padding-left": [/^\d+(?:\.\d+)?(?:px|pt|em|rem)$/],
                "text-decoration": [/^(underline|line-through|none)$/],
            }
        },
        allowedSchemes: ["http", "https", "mailto"],
        allowedSchemesByTag: {
            img: ["http", "https", "data"],
            iframe: ["https"]
        },
        allowedIframeHostnames: [
            "www.youtube.com",
            "youtube.com",
            "player.vimeo.com",
            "vimeo.com",
            "codesandbox.io"
        ],
        transformTags: {
            "a": (tagName, attribs) => {
                // Ensure external links have rel="noopener noreferrer"
                if (attribs.href && !attribs.href.startsWith("#") && !attribs.href.startsWith("/")) {
                    return {
                        tagName: "a",
                        attribs: {
                            ...attribs,
                            target: "_blank",
                            rel: "noopener noreferrer",
                        }
                    };
                }
                return { tagName: "a", attribs };
            }
        }
    });
}
