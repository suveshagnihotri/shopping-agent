import mongoose, { Schema, Document } from 'mongoose';

export interface IPrompt extends Document {
    content: string;
    version: number;
    isActive: boolean;
    createdAt: Date;
}

const PromptSchema: Schema = new Schema({
    content: { type: String, required: true },
    version: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

// Ensure only one prompt is active at a time
PromptSchema.pre<IPrompt>('save', async function () {
    if (this.isActive) {
        await mongoose.model('Prompt').updateMany(
            { _id: { $ne: this._id } },
            { $set: { isActive: false } }
        );
    }
});

export default mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);
