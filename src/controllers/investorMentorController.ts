import { Request, Response } from "express";
import InvestorMentor from "../models/InvestorMentor";

export const getAllInvestorMentors = async (req: Request, res: Response) => {
  try {
    const investorsMentors = await InvestorMentor.find();

    res.status(200).json({
      success: true,
      data: investorsMentors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch investor/mentor data",
    });
  }
};