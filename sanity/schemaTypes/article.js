export default {
    name: 'article',
    title: 'Documentation',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'slug',
            title: 'URL Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }],
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{ type: 'author' }],
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        },
        {
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
                { type: 'block' },
                {
                    type: 'image',
                    options: { hotspot: true },
                },
            ],
        },
        {
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                layout: 'tags',
            },
        },
        {
            name: 'difficulty',
            title: 'Difficulty Level',
            type: 'string',
            options: {
                list: ['Beginner', 'Intermediate', 'Advanced'],
            },
        },
        {
            name: 'estimatedReadTime',
            title: 'Estimated Read Time (minutes)',
            type: 'number',
        },
        {
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
        },
        {
            name: 'updatedAt',
            title: 'Updated At',
            type: 'datetime',
        },
        {
            name: 'featured',
            title: 'Featured',
            type: 'boolean',
            initialValue: false,
        },
    ],
    preview: {
        select: {
            title: 'title',
            category: 'category.title',
            difficulty: 'difficulty',
        },
        prepare(selection) {
            const { title, category, difficulty } = selection
            return {
                title,
                subtitle: `${category} • ${difficulty}`,
            }
        },
    },
}
