import { Request, Response } from "express";
import User from "../models/User";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        credits: 5,
        timestamp: new Date(),
      });
      await user.save();
      console.log(`✅ New user created: ${email}`);
      res.json({ success: true, exists: false });
    } else {
      console.log(`ℹ️ User already exists: ${email}`);
      res.json({ success: true, exists: true });
    }
  } catch (error) {
    console.error("❌ Error creating/checking user:", error);
    res.status(500).json({ message: "Error checking or creating user", error });
  }
};