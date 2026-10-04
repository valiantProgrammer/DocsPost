"use client";

import CodeBlockView from "@/components/editor/extensions/CodeBlockView";

/**
 * Public document and markdown code block renderer.
 * Directly re-exports CodeBlockView to guarantee identical rendering across Write,
 * Preview, and public pages.
 */
export default CodeBlockView;
