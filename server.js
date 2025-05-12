const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Hardcoded credentials - updated for password1 and password2
const PASSWORD1 = 'Kraftwerk';
const PASSWORD2 = 'Bibliothek';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Now username contains password1 and password contains password2
  if (username === PASSWORD1 && password === PASSWORD2) {
    return res.status(200).json({ message: 'Login successful', token: 'dummy-token' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

app.listen(8080, () => console.log('Server running on http://localhost:8080'));