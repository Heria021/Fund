import express from "express";
import { searchInvestorMentor } from "../controllers/searchController";

const router = express.Router();

router.post("/search", searchInvestorMentor);

export default router;