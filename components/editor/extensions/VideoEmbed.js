import { Node, mergeAttributes } from "@tiptap/core";
import { getEmbedUrl } from "@/lib/markdown";

export const VideoEmbed = Node.create({
    name: "videoEmbed",
    group: "block",
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "iframe[src]",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const embedUrl = getEmbedUrl(HTMLAttributes.src) || HTMLAttributes.src;
        return [
            "div",
            { class: "video-embed-wrapper", style: "position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0; border-radius: 12px;" },
            [
                "iframe",
                mergeAttributes(HTMLAttributes, {
                    src: embedUrl,
                    frameBorder: "0",
                    allowFullScreen: "true",
                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                    style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;",
                }),
            ],
        ];
    },

    addCommands() {
        return {
            setVideoEmbed:
                (options) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: options,
                    });
                },
        };
    },
});
