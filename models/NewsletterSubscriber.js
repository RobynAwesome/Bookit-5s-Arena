import mongoose from "mongoose";

const NewsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ["popup", "profile", "admin", "import"],
      default: "popup",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

if (mongoose.models.NewsletterSubscriber) {
  try {
    mongoose.deleteModel("NewsletterSubscriber");
  } catch {}
}

export default mongoose.model(
  "NewsletterSubscriber",
  NewsletterSubscriberSchema,
);
