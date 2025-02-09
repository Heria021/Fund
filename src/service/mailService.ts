
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI!;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: ADMIN_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken as string,
      },
    });

    const mailOptions = {
      from: `"Startup Network" <${ADMIN_EMAIL}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Email Sending Error:", error);
  }
};

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
export const checkEmails = async () => {
  try {
    console.log("📩 Checking unread emails for recharge requests...");

    const unreadEmails = await gmail.users.messages.list({
      userId: "me",
      q: "subject:'recharge 5 credits' is:unread",
      maxResults: 10,
    });

    if (!unreadEmails.data.messages || unreadEmails.data.messages.length === 0) {
      console.log("📭 No new unread emails found.");
      return;
    }

    for (const msg of unreadEmails.data.messages) {
      const emailData = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
      });

      const headers = emailData.data.payload?.headers || [];
      const senderHeader = headers.find((h) => h.name === "From");
      const senderEmail = senderHeader ? senderHeader.value?.split("<")[1].replace(">", "") : null;

      if (!senderEmail) {
        console.log("⚠️ Could not extract sender email. Skipping...");
        continue;
      }

      const bodyPart = emailData.data.payload?.parts?.find((p) => p.mimeType === "text/plain");
      const emailBody = bodyPart?.body?.data
        ? Buffer.from(bodyPart.body.data, "base64").toString("utf-8")
        : "";

      console.log(`📨 Processing email from ${senderEmail}`);

      if (!emailBody.toLowerCase().includes("recharge 5 credits")) {
        console.log(`🚫 Ignoring invalid email from ${senderEmail}`);
        continue;
      }

      const existingRequests = await gmail.users.messages.list({
        userId: "me",
        q: `from:${senderEmail} subject:'recharge 5 credits'`,
        maxResults: 100, 
      });

      if (existingRequests.data.messages && existingRequests.data.messages.length > 1) {
        console.log(`⛔ ${senderEmail} has already requested credits before. Sending rejection email.`);
        await sendRejectionEmail(senderEmail);
      } else {
        const user = await User.findOne({ email: senderEmail });

        if (!user) {
          console.log(`❌ User ${senderEmail} not found`);
          continue;
        }

        user.credits += 5;
        await user.save();

        console.log(`✅ Recharged 5 credits for ${senderEmail}`);
        await sendSuccessEmail(senderEmail);
      }

      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id!,
        requestBody: { removeLabelIds: ["UNREAD"] }, 
      });

      console.log(`📩 Marked email from ${senderEmail} as read.`);
    }
  } catch (error) {
    console.error("❌ Error checking emails:", error);
  }
};
const sendRejectionEmail = async (email: string) => {
  await sendEmail(email, "Recharge Request Denied", "Sorry, we are not offering additional credits at this time.");
  console.log(`🚫 Sent rejection email to ${email}`);
};

const sendSuccessEmail = async (email: string) => {
  await sendEmail(email, "Recharge Successful", "Your credits have been recharged successfully!");
  console.log(`📩 Sent success email to ${email}`);
};