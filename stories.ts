import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        effort: {
            type: Number,
            default: null,
        },
        done: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const StoryModel = mongoose.model<mongoose.Document<IStory>>("StoryDemo", StorySchema);

interface IStory {
    title: string;
    effort?: number | null;
    done?: boolean | null;
}

function createStory(newStory: IStory) {
    const story = new StoryModel(newStory);
    return story.save();
}

function getStories() {
    return StoryModel.find();
}

export default {
    createStory,
    getStories,
};
