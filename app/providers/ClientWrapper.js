"use client"

import { ThemeProvider } from "./ThemeProvider";

export function ClientWrapper({ children }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
