require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pica } = require("@picahq/ai");
const { openai } = require("@ai-sdk/openai");
const { generateText } = require("ai");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Initialize Pica
    const pica = new Pica(process.env.PICA_SECRET_KEY);

    // Generate the system prompt
    const systemPrompt = await pica.generateSystemPrompt();

    console.log("System Prompt:", systemPrompt); // Debug log

    // Create the response using generateText
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      tools: { ...pica.oneTool },
      prompt: messages[messages.length - 1].content, // Get the last message
      maxSteps: 5,
    });

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
