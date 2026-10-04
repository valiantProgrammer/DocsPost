import mongoose, { models, model } from 'mongoose';
const { Schema } = mongoose;

const topicHierarchicalSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Topic',
            default: null,
        },
        level: {
            type: Number,
            default: 0,
            min: 0,
        },
        path: {
            type: [Schema.Types.ObjectId],
            ref: 'Topic',
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

topicHierarchicalSchema.index({ parent: 1, name: 1 }, { unique: true });

export default models.Topic || model('Topic', topicHierarchicalSchema);