import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app";
import { checkEmails } from "./service/mailService";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startCheckingEmails = async () => {
  console.log("📩 Checking emails for recharge requests...");
  await checkEmails(); 
  setTimeout(startCheckingEmails, 10 * 60 * 1000);
};

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  startCheckingEmails();
});