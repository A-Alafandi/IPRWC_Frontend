const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

// Serve static files from dist/browser
app.use(express.static(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend/browser')));

// Angular SSR handler
app.use('/**', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend/browser/index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running on port ${port}`);
});
