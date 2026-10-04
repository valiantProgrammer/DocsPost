import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockView from "./CodeBlockView";
import { normalizeCode } from "../../../lib/shikiTheme";

export const CodeBlockNode = Node.create({
    name: "codeBlock",
    group: "block",
    atom: true, // Atom node: no ProseMirror text content inside, so raw text can never render outside!
    defining: true,
    draggable: false,
    selectable: true,

    addAttributes() {
        return {
            language: {
                default: "bash",
                parseHTML: (element) => {
                    const codeEl = element.querySelector("code");
                    const cls = codeEl?.getAttribute("class") || element.getAttribute("class") || "";
                    const match = cls.match(/language-(\w+)/);
                    if (match) return match[1];
                    const dataLang = codeEl?.getAttribute("data-language") || element.getAttribute("data-language");
                    return dataLang || "bash";
                },
                renderHTML: (attributes) => ({
                    "data-language": attributes.language || "bash",
                }),
            },
            code: {
                default: "",
                parseHTML: (element) => {
                    const codeEl = element.querySelector("code");
                    const text = (codeEl || element).textContent || "";
                    return normalizeCode(text);
                },
                renderHTML: () => ({}),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "pre",
                preserveWhitespace: "full",
                getAttrs: (node) => {
                    const codeEl = node.querySelector("code");
                    const cls = codeEl?.getAttribute("class") || node.getAttribute("class") || "";
                    const match = cls.match(/language-(\w+)/);
                    const lang = match ? match[1] : (codeEl?.getAttribute("data-language") || "bash");
                    const text = (codeEl || node).textContent || "";
                    return {
                        language: lang,
                        code: normalizeCode(text),
                    };
                },
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const lang = node.attrs.language || "bash";
        return [
            "pre",
            mergeAttributes(HTMLAttributes, { class: `codeblock-card` }),
            [
                "code",
                {
                    class: `language-${lang}`,
                    "data-language": lang,
                },
                normalizeCode(node.attrs.code || ""),
            ],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockView);
    },

    addCommands() {
        return {
            setCodeBlock:
                (attributes) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: attributes || { language: "bash", code: "" },
                    });
                },
        };
    },

    addKeyboardShortcuts() {
        return {
            "Mod-Alt-c": () => this.editor.commands.setCodeBlock(),
            "Mod-Enter": ({ editor }) => {
                const { state } = editor;
                const { selection } = state;
                const { $from } = selection;
                const node = $from.node();
                if (node?.type.name === this.name) {
                    const endPos = $from.after();
                    return editor
                        .chain()
                        .insertContentAt(endPos, { type: "paragraph" })
                        .setTextSelection(endPos + 1)
                        .focus()
                        .run();
                }
                return false;
            },
        };
    },

    addStorage() {
        return {
            markdown: {
                serialize(state, node) {
                    const code = normalizeCode(node.attrs.code || "");
                    // Calculate fence longer than any sequence of backticks in code
                    const backtickMatches = code.match(/`+/g);
                    let fenceLength = 3;
                    if (backtickMatches) {
                        for (const m of backtickMatches) {
                            if (m.length >= fenceLength) {
                                fenceLength = m.length + 1;
                            }
                        }
                    }
                    const fence = "`".repeat(fenceLength);
                    const lang = node.attrs.language || "";

                    state.write(`${fence}${lang}\n`);
                    state.text(code, false); // false = do not escape markdown characters
                    state.ensureNewLine();
                    state.write(`${fence}`);
                    state.closeBlock(node);
                },
                parse: {
                    setup(markdownit) {
                        // markdown-it default fence renderer outputs <pre><code class="language-x">...</code></pre>
                        // which matches our parseHTML rule seamlessly!
                    },
                },
            },
        };
    },
});
