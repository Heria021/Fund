import mongoose, { Document, Schema } from "mongoose";

enum Category {
  AI = "AI",
  Blockchain = "Blockchain",
  EV = "EV",
  Ecommerce = "Ecommerce",
  Video = "Video",
}

enum Type {
  Investor = "Investor",
  Mentor = "Mentor",
}

interface IInvestorMentor extends Document {
  name: string;
  category: Category;
  type: Type;
}

const InvestorMentorSchema = new Schema<IInvestorMentor>(
  {
    name: { type: String, required: true },
    category: { type: String, enum: Object.values(Category), required: true },
    type: { type: String, enum: Object.values(Type), required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInvestorMentor>("InvestorMentor", InvestorMentorSchema);