import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  credits: number;
  timestamp: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    credits: { type: Number, required: true, default: 0 },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);