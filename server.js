const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the Angular dist directory
app.use(express.static(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend')));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`App available at: http://localhost:${port}`);
});
