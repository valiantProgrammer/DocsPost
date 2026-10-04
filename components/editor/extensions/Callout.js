import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CalloutView from "./CalloutView";

export const Callout = Node.create({
    name: "callout",
    group: "block",
    content: "block+",
    defining: true,

    addAttributes() {
        return {
            type: {
                default: "info",
                parseHTML: (element) => element.getAttribute("data-callout-type") || "info",
                renderHTML: (attributes) => ({
                    "data-callout-type": attributes.type,
                }),
            },
            title: {
                default: "What you will learn",
                parseHTML: (element) => element.getAttribute("data-callout-title") || "What you will learn",
                renderHTML: (attributes) => ({
                    "data-callout-title": attributes.title,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div[data-callout-type]",
                getAttrs: (element) => ({
                    type: element.getAttribute("data-callout-type") || "info",
                    title: element.getAttribute("data-callout-title") || "What you will learn",
                }),
            },
            {
                tag: "blockquote",
                priority: 60,
                getAttrs: (element) => {
                    const firstP = element.querySelector("p");
                    const text = firstP?.textContent || element.textContent || "";
                    const match = text.match(/^\s*\[!([a-zA-Z]+)\](?:\s+(.*))?$/m);
                    if (match) {
                        return {
                            type: match[1].toLowerCase(),
                            title: match[2]?.trim() || "What you will learn",
                        };
                    }
                    return false;
                },
                contentElement: (element) => {
                    const firstP = element.querySelector("p");
                    if (firstP && /^\s*\[!([a-zA-Z]+)\]/.test(firstP.textContent || "")) {
                        const clone = element.cloneNode(true);
                        const cloneP = clone.querySelector("p");
                        if (cloneP) cloneP.remove();
                        return clone;
                    }
                    return element;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                class: `editor-callout editor-callout-${HTMLAttributes["data-callout-type"] || "info"}`,
                "data-callout-type": HTMLAttributes["data-callout-type"] || "info",
                "data-callout-title": HTMLAttributes["data-callout-title"] || "What you will learn",
            }),
            0,
        ];
    },

    addStorage() {
        return {
            markdown: {
                serialize(state, node) {
                    const type = node.attrs.type || "info";
                    const title = node.attrs.title || "Note";
                    const header = `[!${type}] ${title}\n`;
                    state.wrapBlock("> ", null, node, () => {
                        state.write(header);
                        state.renderContent(node);
                    });
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(CalloutView);
    },

    addCommands() {
        return {
            setCallout:
                (attributes) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: attributes || { type: "info", title: "What you will learn" },
                        content: [
                            {
                                type: "paragraph",
                            },
                        ],
                    });
                },
            toggleCallout:
                (attributes) =>
                ({ commands }) => {
                    return commands.toggleWrap(this.name, attributes);
                },
        };
    },
});
