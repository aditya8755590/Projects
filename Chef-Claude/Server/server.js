import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  const { ingredients } = req.body;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt-neo-125M",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Create a recipe using these ingredients: ${ingredients.join(", ")}`,
        }),
      }
    );

    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error("Hugging Face returned non-JSON:", text);
      return res.status(500).json({
        error: "Hugging Face API returned non-JSON response",
        raw: text,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error calling Hugging Face API");
  }
});

app.listen(5001, () => console.log("✅ Server running on port 5001"));