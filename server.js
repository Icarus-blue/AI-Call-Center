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

    if (req.body.Digits) {
        switch (req.body.Digits) {
            case '1':
                twiml.say('You pressed 1. I will now tell you about our business.', { voice: 'alice' });
                break;
            case '2':
                twiml.say('You pressed 2. I will help you schedule a meeting.', { voice: 'alice' });
                break;
            case '0':
                twiml.say('You pressed 0. Goodbye!', { voice: 'alice' });
                twiml.hangup();
                break;
            default:
                twiml.say('Sorry, I did not understand that choice.', { voice: 'alice' });
                twiml.redirect('/voice');
                break;
        }
    } else {
        const gather = twiml.gather({ numDigits: 1 });
        gather.say('Thanks for contacting us. If you want to know about our business, please press 1. If you want to schedule a meeting, press 2. If you want to finish, press 0.', { voice: 'alice' });
    }

    res.type('text/xml');
    res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
