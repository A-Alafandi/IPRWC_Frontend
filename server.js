const express = require('express');
const path = require('path');
const app = express();

// Serve static files from Angular dist directory
app.use(express.static(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend'), {
  index: false, // Don't serve index.html for directory requests
  fallthrough: true // Allow the request to continue to the next middleware if file not found
}));

// Handle all routes by serving index.html, but only for non-file requests
app.get('*', (req, res, next) => {
  // Check if the request is for a file (has a file extension and not a route)
  if (req.path.includes('.') && !req.path.endsWith('/')) {
    // If it's a file request that wasn't found, return 404
    return res.status(404).send('File not found');
  }

  // Serve index.html for all route requests (SPA routing)
  res.sendFile(path.join(__dirname, 'dist/ipwrwc-e-commerce-frontend/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`App available at: http://localhost:${port}`);
});
