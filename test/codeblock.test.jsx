import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { normalizeCode, highlightCodeToTokens } from "../lib/shikiTheme";
import CodeBlockView from "../components/editor/extensions/CodeBlockView";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const PYTHON_SAMPLE = `from fastapi import FastAPI

app = FastAPI(title="DocsPost API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Hello, DocsPost!"}`;

const PYTHON_SAMPLE_CRLF =
    "from fastapi import FastAPI\r\n\r\napp = FastAPI(title=\"DocsPost API\", version=\"1.0.0\")\r\n\r\n@app.get(\"/\")\r\ndef read_root():\r\n    return {\"message\": \"Hello, DocsPost!\"}\r\n";

describe("CodeBlock normalization and tokenization", () => {
    it("normalizeCode('a\\r\\n\\r\\nb\\r\\n') -> 'a\\n\\nb' and lines.length === 3", () => {
        const normalized = normalizeCode("a\r\n\r\nb\r\n");
        expect(normalized).toBe("a\n\nb");
        const lines = normalized.split("\n");
        expect(lines.length).toBe(3);
        expect(lines[0]).toBe("a");
        expect(lines[1]).toBe("");
        expect(lines[2]).toBe("b");
    });

    it("A block with CRLF input produces identical normalized code to LF input", () => {
        const normLF = normalizeCode(PYTHON_SAMPLE);
        const normCRLF = normalizeCode(PYTHON_SAMPLE_CRLF);
        expect(normCRLF).toBe(normLF);
        expect(normCRLF.split("\n").length).toBe(7);
    });

    it("produces exactly 7 lines of tokens with rows 2 and 4 empty and row 7 indented by 4 spaces", async () => {
        const tokenLines = await highlightCodeToTokens(PYTHON_SAMPLE, "python");
        expect(tokenLines.length).toBe(7);

        // Rows 2 and 4 have 0 tokens (empty lines)
        expect(tokenLines[1]).toEqual([]);
        expect(tokenLines[3]).toEqual([]);

        // Row 7 starts with 4 spaces
        const row7Text = tokenLines[6].map((t) => t.content).join("");
        expect(row7Text.startsWith("    ")).toBe(true);
        expect(row7Text).toBe('    return {"message": "Hello, DocsPost!"}');
    });
});

describe("CodeBlockView Component DOM rendering", () => {
    let container;
    let root;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        container = null;
    });

    it("renders exactly 7 rows numbered 1-7 with rows 2 and 4 visibly empty and row 7 indented by 4 spaces", async () => {
        await act(async () => {
            root.render(<CodeBlockView code={PYTHON_SAMPLE} language="python" />);
        });

        // Allow async token highlighting effect to complete
        await act(async () => {
            await new Promise((r) => setTimeout(r, 100));
        });

        const rows = container.querySelectorAll(".cb-row");
        expect(rows.length).toBe(7);

        // Numbers 1 through 7 in the gutter
        const gutterCells = container.querySelectorAll(".cb-ln");
        expect(gutterCells.length).toBe(7);
        gutterCells.forEach((cell, idx) => {
            expect(cell.textContent.trim()).toBe(String(idx + 1));
        });

        // Rows 2 and 4 (.cb-code) contain zero-width space for non-collapsing empty rows
        const codeCells = container.querySelectorAll(".cb-code");
        expect(codeCells.length).toBe(7);
        expect(codeCells[1].textContent).toBe("\u200B");
        expect(codeCells[3].textContent).toBe("\u200B");

        // Row 7 is indented by 4 characters
        expect(codeCells[6].textContent.startsWith("    ")).toBe(true);
    });

    it("DOM test: every .cb-ln has the same top offset as its sibling .cb-code in the same row", async () => {
        await act(async () => {
            root.render(<CodeBlockView code={PYTHON_SAMPLE} language="python" />);
        });
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        const rows = container.querySelectorAll(".cb-row");
        expect(rows.length).toBe(7);

        rows.forEach((row, i) => {
            const ln = row.querySelector(".cb-ln");
            const code = row.querySelector(".cb-code");
            expect(ln).toBeTruthy();
            expect(code).toBeTruthy();

            // In the same CSS grid row, sibling offsets are equal (difference 0)
            const diff = Math.abs(ln.offsetTop - code.offsetTop);
            expect(diff).toBe(0);
        });
    });

    it("A block with CRLF input renders the same number of rows as the same block with LF input", async () => {
        let containerLF = document.createElement("div");
        let containerCRLF = document.createElement("div");
        document.body.appendChild(containerLF);
        document.body.appendChild(containerCRLF);

        let rootLF = createRoot(containerLF);
        let rootCRLF = createRoot(containerCRLF);

        await act(async () => {
            rootLF.render(<CodeBlockView code={PYTHON_SAMPLE} language="python" />);
            rootCRLF.render(<CodeBlockView code={PYTHON_SAMPLE_CRLF} language="python" />);
        });
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        const rowsLF = containerLF.querySelectorAll(".cb-row");
        const rowsCRLF = containerCRLF.querySelectorAll(".cb-row");
        expect(rowsCRLF.length).toBe(rowsLF.length);
        expect(rowsCRLF.length).toBe(7);

        act(() => {
            rootLF.unmount();
            rootCRLF.unmount();
        });
        containerLF.remove();
        containerCRLF.remove();
    });

    it("A 120-character line does not wrap into multiple rows and maintains single-row structure", async () => {
        const longLine =
            "# " + "x".repeat(120) + "\nprint('done')";
        await act(async () => {
            root.render(<CodeBlockView code={longLine} language="python" />);
        });
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        const rows = container.querySelectorAll(".cb-row");
        expect(rows.length).toBe(2);

        const codeCell = rows[0].querySelector(".cb-code");
        expect(codeCell.textContent).toContain("x".repeat(120));
    });
});
