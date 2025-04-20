const { Configuration, OpenAIApi } = require("openai");

function createOpenAIClient(apiKey) {
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  return new OpenAIApi(configuration);
}

module.exports = { createOpenAIClient };
