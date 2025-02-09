import { Request, Response } from "express";
import User from "../models/User";
import InvestorMentor from "../models/InvestorMentor";
import { fetchGeminiResponse } from "../utils/gemini";
import { sendEmail } from "../service/mailService";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export const searchInvestorMentor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, query } = req.body;

    if (!email || !query) {
      res.status(400).json({ message: "Email and query are required." });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    console.log('pass 1')
    if (user.credits <= 0) {
      await sendEmail(email, "Credit Exhausted",
        `Your credits are exhausted. Please send a new email with subject "recharge 5 credits" to ${ADMIN_EMAIL} to get credits.`);

      res.json({
        success: true,
        response: {
          status: false,
          response: ["credit over"]
        }
      });
      return;
    }

    console.log('pass 2')
    const databaseData = await InvestorMentor.find();

    const aiResponse = await fetchGeminiResponse(query, databaseData);

    user.credits -= 1;
    await user.save();

    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("❌ Error processing search request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


