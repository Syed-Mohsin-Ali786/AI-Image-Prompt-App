import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import process from "process";
import axios from "axios";
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const API_KEY = process.env.STABILITY_API_KEY;
const PORT = process.env.PORT;

// Stability API endpoint
const STABILITY_URL =
  "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
app.post("/generate-image", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await axios.post(
      STABILITY_URL,
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        width: 1024, // ✅ valid
        height: 1024, // ✅ valid
        steps: 30,
        samples: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    // Image comes as base64
    const imageBase64 = response.data.artifacts.map((art) => art.base64);

    res.json({ images: imageBase64 });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});
