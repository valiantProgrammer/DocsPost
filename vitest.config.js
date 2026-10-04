import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [
        react({
            include: /\.(jsx|js)$/,
        }),
    ],
    test: {
        environment: "happy-dom",
        globals: true,
        include: ["test/**/*.test.{js,jsx}"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./"),
        },
    },
});
