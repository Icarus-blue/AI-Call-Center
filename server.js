require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { VoiceResponse } = require('twilio').twiml;
const openai = require('openai');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;

openai.apiKey = openaiApiKey;

app.post('/voice', (req, res) => {
    const twiml = new VoiceResponse();

    // If the customer speaks (speech recognition)
    if (req.body.SpeechResult) {
        console.log('Received speech input:', req.body.SpeechResult);
        
        // Send speech input to OpenAI for a response
        openai.Completion.create({
            model: 'text-davinci-003', // or any other available model
            prompt: req.body.SpeechResult,
            max_tokens: 150
        }).then((openaiResponse) => {
            const aiResponse = openaiResponse.choices[0].text.trim();
            twiml.say(aiResponse, { voice: 'alice' });
            res.type('text/xml');
            res.send(twiml.toString());
        }).catch((error) => {
            console.error('Error with OpenAI API:', error);
            twiml.say('Sorry, I couldn\'t understand your question.', { voice: 'alice' });
            res.type('text/xml');
            res.send(twiml.toString());
        });
    } else {
        // If no speech result yet, gather voice input
        const gather = twiml.gather({
            input: 'speech',
            timeout: 5,
            hints: 'business, schedule, goodbye'
        });
        gather.say('Thanks for contacting us. How can I assist you today?', { voice: 'alice' });
        twiml.redirect('/voice');
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
