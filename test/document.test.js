import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { CodeBlockNode } from "../components/editor/extensions/CodeBlockNode";
import { Callout } from "../components/editor/extensions/Callout";
import { renderDocumentJsonToHtml } from "../lib/documentRender";

const TEST_DOCUMENT = `
# Introduction

FastAPI is a modern, fast (high-performance) web framework for building APIs
with Python 3.8+ based on \`standard Python type hints\`.

> [!info] What you will learn
> - Set up a FastAPI project from scratch
> - Build and structure API endpoints
> - Implement authentication with JWT

## Project Setup

\`\`\`bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install FastAPI and dependencies
pip install fastapi uvicorn sqlmodel python-jose[cryptography]
\`\`\`

## Building a Simple API

\`\`\`python
from fastapi import FastAPI

app = FastAPI(title="DocsPost API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Hello, DocsPost!"}
\`\`\`
`.trim();

describe("DocsPost Document Parsing & Serialization", () => {
    it("parses test document without headings created from code comments and produces valid HTML without escaped literal tags", () => {
        const editor = new Editor({
            extensions: [
                StarterKit.configure({
                    codeBlock: false,
                    heading: { levels: [1, 2, 3] },
                }),
                CodeBlockNode,
                Callout,
                Markdown.configure({
                    html: true,
                    tightLists: true,
                }),
            ],
            content: TEST_DOCUMENT,
        });

        const json = editor.getJSON();

        // 1. Assert exactly two code blocks exist
        const codeBlocks = [];
        const headings = [];

        function traverse(node) {
            if (node.type === "codeBlock") {
                codeBlocks.push(node);
            }
            if (node.type === "heading") {
                const text = node.content?.map((c) => c.text).join("") || "";
                headings.push({ level: node.attrs?.level, text });
            }
            if (node.content) {
                node.content.forEach(traverse);
            }
        }
        traverse(json);

        expect(codeBlocks.length).toBe(2);

        // 2. Assert languages
        expect(codeBlocks[0].attrs.language).toBe("bash");
        expect(codeBlocks[1].attrs.language).toBe("python");

        // 3. Assert all code lines are inside them
        expect(codeBlocks[0].attrs.code).toContain("# Create a virtual environment");
        expect(codeBlocks[0].attrs.code).toContain("python -m venv venv");
        expect(codeBlocks[0].attrs.code).toContain("# Install FastAPI and dependencies");
        expect(codeBlocks[0].attrs.code).toContain("pip install fastapi uvicorn sqlmodel");

        expect(codeBlocks[1].attrs.code).toContain("from fastapi import FastAPI");
        expect(codeBlocks[1].attrs.code).toContain('app = FastAPI(title="DocsPost API", version="1.0.0")');
        expect(codeBlocks[1].attrs.code).toContain('return {"message": "Hello, DocsPost!"}');

        // 4. Assert headings: ONLY Introduction, Project Setup, Building a Simple API
        expect(headings.length).toBe(3);
        expect(headings[0].text).toBe("Introduction");
        expect(headings[1].text).toBe("Project Setup");
        expect(headings[2].text).toBe("Building a Simple API");

        // Assure "# Install FastAPI and dependencies" NEVER became a heading
        const headingTexts = headings.map((h) => h.text);
        expect(headingTexts).not.toContain("Install FastAPI and dependencies");

        // 5. Assert Callout exists with title and list items
        let calloutNode = null;
        function findCallout(node) {
            if (node.type === "callout") calloutNode = node;
            if (node.content) node.content.forEach(findCallout);
        }
        findCallout(json);

        expect(calloutNode).not.toBeNull();
        expect(calloutNode.attrs.type).toBe("info");
        expect(calloutNode.attrs.title).toBe("What you will learn");

        // Check bullet list inside callout
        const listNode = calloutNode.content?.find((c) => c.type === "bulletList");
        expect(listNode).toBeDefined();
        expect(listNode.content?.length).toBe(3);

        // 6. Test HTML generation from same JSON: assert NO literal "<p>" (i.e. &lt;p&gt;)
        const html = renderDocumentJsonToHtml(json);
        expect(html).not.toContain("&lt;p&gt;");
        expect(html).not.toContain("&lt;h1&gt;");
        expect(html).not.toContain("&lt;div");
        expect(html).toContain("<h1>Introduction</h1>");
        expect(html).toContain("What you will learn");

        // 7. Test round-trip markdown serialization
        const serialized = editor.storage.markdown.getMarkdown();
        expect(serialized).toContain("```bash");
        expect(serialized).toContain("```python");
        expect(serialized).toContain("> [!info] What you will learn");
        expect(serialized).toContain("Set up a FastAPI project from scratch");

        editor.destroy();
    });
});
