export default {
    name: 'category',
    title: 'Category',
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
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        },
        {
            name: 'icon',
            title: 'Icon (emoji or icon name)',
            type: 'string',
        },
        {
            name: 'color',
            title: 'Category Color',
            type: 'string',
            options: {
                list: ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'orange'],
            },
        },
        {
            name: 'order',
            title: 'Display Order',
            type: 'number',
        },
    ],
    preview: {
        select: {
            title: 'title',
            icon: 'icon',
        },
        prepare(selection) {
            const { title, icon } = selection
            return {
                title: `${icon || '📁'} ${title}`,
            }
        },
    },
}
