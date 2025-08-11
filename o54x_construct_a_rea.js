const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const uuid = require('uuid');

// chatbot integrators
const integrators = {
  facebook: {
    api: 'https://graph.facebook.com/v13.0/me/messages',
    apiKey: 'YOUR_FACEBOOK_API_KEY',
  },
  whatsapp: {
    api: 'https://graph.facebook.com/v13.0/me/messages',
    apiKey: 'YOUR_WHATSAPP_API_KEY',
  },
  slack: {
    api: 'https://slack.com/api/chat.postMessage',
    apiKey: 'YOUR_SLACK_API_KEY',
  },
};

app.use(bodyParser.json());

// chatbot response builder
function buildResponse(message, integrator) {
  let response;
  switch (integrator) {
    case 'facebook':
      response = {
        recipient: {
          id: message.senderId,
        },
        message: {
          text: message.text,
        },
      };
      break;
    case 'whatsapp':
      response = {
        messaging_product: 'whatsapp',
        to: message.senderId,
        type: 'text',
        text: {
          body: message.text,
        },
      };
      break;
    case 'slack':
      response = {
        channel: message.channel,
        text: message.text,
      };
      break;
    default:
      response = null;
  }
  return response;
}

// chatbot integrator API
app.post('/api/integrate', (req, res) => {
  const integrator = req.body.integrator;
  const message = req.body.message;
  const response = buildResponse(message, integrator);
  if (response) {
    const options = {
      method: 'POST',
      uri: integrators[integrator].api,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${integrators[integrator].apiKey}`,
      },
      body: JSON.stringify(response),
    };
    rp(options).then((response) => {
      res.json({ status: 'success', message: 'Message sent successfully' });
    }).catch((error) => {
      res.json({ status: 'error', message: 'Error sending message' });
    });
  } else {
    res.json({ status: 'error', message: 'Invalid integrator' });
  }
});

// start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});