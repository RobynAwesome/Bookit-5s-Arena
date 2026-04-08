import mongoose from "mongoose";

const ReactorChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    searchQuery: { type: String, default: "" },
    channelId: { type: String, default: "" },
    teamFocus: [{ type: String }],
    enabled: { type: Boolean, default: true },
    priority: { type: Number, default: 100 },
  },
  { timestamps: true },
);

export default mongoose.models.ReactorChannel ||
  mongoose.model("ReactorChannel", ReactorChannelSchema);
