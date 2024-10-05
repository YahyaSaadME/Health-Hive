const axios = require("axios");
const express = require("express");
const CR = express.Router();

class BlackBox {
  constructor(secId) {
    this.baseUrl = "https://www.blackbox.ai";
    this.api = "https://www.blackbox.ai/api";
    this.chatEndpoint = `${this.api}/chat`;
    this.checkEndpoint = `${this.api}/check`;
    this.secId = secId;

    // Create a new Axios instance with session cookies
    this.session = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Cookie: `sessionId=${secId};`, // Add other cookie values if necessary
      },
    });
  }

  remove(inputString) {
    // Remove patterns like $@$ from the input string (if any)
    const pattern = /\$\@.*?\$\@\$/g;
    let result = inputString.replace(pattern, "").replace(/\n/g, "");
    let contentInsideBraces = result.match(/\{([^}]*)\}/g);

    contentInsideBraces = contentInsideBraces.map((str) =>
      str.replace(/[{}]/g, "").trim()
    );
    return `{${contentInsideBraces.join(" ")}}`;
  }

  async get(message) {
    const requestBody = {
      query: message,
      messages: [{ role: "user", content: message, id: "BLRH0Ly" }],
      index: null,
    };

    try {
      const resp = await this.session.post(this.checkEndpoint, requestBody);
      console.log(resp.data);
      return resp.data;
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  }

  async chat(message) {
    const requestBody = {
      messages: [
        {
          id: "B8qeNUg",
          content:
            "@GPT-4o @Claude-Sonnet-3.5 @GPT-4o i have fever of 102 degree i need medicine information, root cause of this like eating sugar, icecream, chololate,etc,.. , is that curious to consulta doctor, and precausions make sure it is a medical issue so it should be accurate and perfect this data will be shown to a patient who don't have good amount of knowledge in biology give him with simple explanation and make sure the medicines are available in india make sure the output always looks like only a json of the result i need like this ``` { 'cause':['....','.....'], 'consutationPriority':'high' or 'low' or 'immediate' or 'no need', 'medicine':['....','...','..'], 'diet':['....','.....'] ,spelist:'General' or 'ENT' or 'Cardiologist' or '....' } ```",
          role: "user",
        },
        {
          id: "B8qeNUg",
          content: `{
            "cause": [
              "Viral or bacterial infection",
              "Overexertion in hot weather",
              "Inflammatory conditions"
            ],
            "consultationPriority": "immediate",
            "medicine": [
              "Paracetamol (Crocin)",
              "Ibuprofen (Brufen)",
              "Aspirin (for adults only, not children)"
            ],
            "diet": [
              "Drink plenty of water",
              "Clear soups or broths",
              "Fresh fruits like oranges and watermelon",
              "Avoid sugary foods, ice cream, and chocolate",
              "Avoid caffeine and alcohol"
            ],
            "specialist": "General"
          }`,
          role: "assistant",
        },
        {
          id: "B8qeNUg",
          content: message,
          role: "user",
        },
      ],
      id: "B8qeNUg",
      previewToken: null,
      userId: this.secId,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      isChromeExt: false,
      githubToken: null,
      clickedAnswer2: false,
      clickedAnswer3: false,
    };

    try {
      const resp = await this.session.post(this.chatEndpoint, requestBody);
    //   console.log(resp.data);
      return resp.data;
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  }
}

const blackbox = new BlackBox("6fc615cc-ab57-4a10-a868-cf95a0c6397e");
CR.post("/", (req, res) => {
  try {
    const { message } = req.body;
    blackbox
      .chat(message)
      .then((response) => {
        const cleanedResponse = blackbox.remove(JSON.stringify(response));
        
        res.json({ message: JSON.parse(cleanedResponse.replace(/\\n/g, '').replace(/\\"/g, '"')) });
      })
      .catch((error) => {
        console.error("Error in chat:", error);
        res.json({ message: "Server error" });
      });
  } catch (e) {
    res.json({ mesage: "Server error" });
  }
});

module.exports = CR;
