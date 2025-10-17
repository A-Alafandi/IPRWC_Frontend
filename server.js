const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the browser directory
app.use(express.static(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend/browser')));

// All other routes should redirect to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend/browser/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
