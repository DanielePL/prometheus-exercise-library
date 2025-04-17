// simple-openai-test.js
const axios = require('axios');
require('dotenv').config();

async function testOpenAI() {
  console.log('API Key loaded successfully!');

  try {
    console.log('Making test request to OpenAI...');
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, give me a quick test response."
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Success! API connection working.');
    console.log('Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.log('\n❌ Error connecting to OpenAI:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Error details:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testOpenAI();