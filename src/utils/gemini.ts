import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const formatDataAsTable = (data: any[]) => {
  let table = "Name | Category | Type\n";
  table += "-".repeat(30) + "\n";

  data.forEach((entry) => {
    table += `${entry.name} | ${entry.category} | ${entry.type}\n`;
  });

  return table;
};

interface GeminiResponse {
  status: boolean;
  response: string | string[];
}


export const fetchGeminiResponse = async (
  query: string,
  data: any[]
): Promise<GeminiResponse> => {
  try {
    const formattedTable = formatDataAsTable(data);

    const prompt = `
      You are an assistant helping users find the best investors or mentors based on their needs.
      Here is a structured table of available investors and mentors:
      \n${formattedTable}\n
      Given the following user query: "${query}", suggest the best match.
      Ensure your response contains only names, separated by commas if there are multiple matches.
      If no matches are found, return exactly "No matches found.".
    `;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    console.log("🔹 Gemini API Response:", response.data);

    const resultText: string =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // If Gemini explicitly says "No matches found.", set status to false
    if (resultText.toLowerCase() === "no matches found.") {
      return { status: false, response: "No matches found." };
    }

    // Extract names from the response
    const names: string[] = resultText
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    return { status: names.length > 0, response: names.length > 0 ? names : "No matches found." };
  } catch (error) {
    console.error("🔴 Error fetching Gemini response:", error);
    return { status: false, response: "Error processing request." };
  }
};