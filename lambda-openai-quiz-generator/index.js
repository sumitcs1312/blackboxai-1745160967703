const { createOpenAIClient } = require("./openai-config");

const openai = createOpenAIClient(process.env.OPENAI_API_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const topic = body.topic;

    if (!topic) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Topic is required" }),
      };
    }

    const prompt = "Generate a quiz with 3 questions on the topic: \"" + topic + "\". Provide each question with 4 options and indicate the correct answer.";

    const completion = await openai.createChatCompletion({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates quizzes." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const quizText = completion.data.choices[0].text.trim();

    // Simple parsing logic to convert quizText to structured JSON
    // This depends on the format returned by OpenAI, adjust as needed
    const quiz = parseQuizText(quizText);

    return {
      statusCode: 200,
      body: JSON.stringify({ quiz }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

function parseQuizText(text) {
  // Basic parser to convert text to quiz JSON
  // This is a placeholder and should be improved based on actual output format
  const questions = [];
  const lines = text.split("\n").filter(line => line.trim() !== "");
  let currentQuestion = null;

  lines.forEach(line => {
    if (/^\d+\./.test(line)) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = { question: line.replace(/^\d+\.\s*/, ""), options: [], answer: "" };
    } else if (/^[A-D]\./.test(line)) {
      currentQuestion.options.push(line.replace(/^[A-D]\.\s*/, ""));
    } else if (/^Answer:/i.test(line)) {
      currentQuestion.answer = line.replace(/^Answer:\s*/i, "");
    }
  });
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  return questions;
}
