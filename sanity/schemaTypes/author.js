export default {
    name: 'author',
    title: 'Author',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Full Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
        },
        {
            name: 'bio',
            title: 'Bio',
            type: 'text',
            rows: 3,
        },
        {
            name: 'image',
            title: 'Profile Picture',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'socialLinks',
            title: 'Social Links',
            type: 'object',
            fields: [
                {
                    name: 'twitter',
                    title: 'Twitter URL',
                    type: 'url',
                },
                {
                    name: 'github',
                    title: 'GitHub URL',
                    type: 'url',
                },
                {
                    name: 'linkedin',
                    title: 'LinkedIn URL',
                    type: 'url',
                },
            ],
        },
    ],
    preview: {
        select: {
            title: 'name',
            media: 'image',
        },
    },
}
