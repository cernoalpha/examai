const express = require('express');
const Prem = require('@premai/prem-sdk');

// Create Express app
const app = express();
app.use(express.json());

const API_KEY = 'brfkmOJw0pImS4GM9NQB53FhahhocDBiZk'; 
const PROJECT_ID = 4402;

const client = new Prem({
  apiKey: API_KEY
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const fetchResponseFromPrem = async (model, messages, session_id) => {
  try {
    const response = await client.chat.completions.create({
      project_id: PROJECT_ID,
      messages,
      model,
      system_prompt: 'Give only answers from now on',
      session_id,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error fetching response from ${model}:`, error);
    throw new Error(`Error fetching response from ${model}`);
  }
};

app.post('/chat-completion-gpt', async (req, res) => {
  const { message } = req.body;
  const messages = [{ role: 'user', content: message }];

  try {
    const gptResponse = await fetchResponseFromPrem('gpt-4o', messages, 'gpt-session');
    res.json({ response: gptResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/chat-completion-claude', async (req, res) => {
  const { message } = req.body;
  const messages = [{ role: 'user', content: message }];

  try {
    const claudeResponse = await fetchResponseFromPrem('claude-3.5-sonnet', messages, 'claude-session');
    res.json({ response: claudeResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
