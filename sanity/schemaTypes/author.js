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
            name: 'city',
            title: 'City',
            type: 'string',
        },
        {
            name: 'country',
            title: 'Country',
            type: 'string',
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
            name: 'educations',
            title: 'Educations',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'type',
                            title: 'Education Type',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'School', value: 'school' },
                                    { title: 'College', value: 'college' },
                                    { title: 'University', value: 'university' },
                                ],
                            },
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: 'institution',
                            title: 'Institution Name',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: 'field',
                            title: 'Field of Study',
                            type: 'string',
                        },
                        {
                            name: 'year',
                            title: 'Year of Completion',
                            type: 'number',
                        },
                    ],
                    preview: {
                        select: {
                            title: 'institution',
                            subtitle: 'field',
                        },
                    },
                },
            ],
        },
        {
            name: 'domains',
            title: 'Domains/Expertise',
            type: 'array',
            of: [
                {
                    type: 'string',
                },
            ],
            options: {
                layout: 'tags',
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
