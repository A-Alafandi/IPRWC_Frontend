const express = require('express');
const path = require('path');
const app = express();


app.use(express.static(path.join(__dirname, 'dist/iprwc-e-commerce-frontend'), {
  index: false // Don't serve index.html for directory requests
}));

app.get('*', (req, res) => {
  // Check if the request is for a file (has a file extension)
  if (req.path.includes('.')) {
    // If it's a file request that wasn't found by static middleware, return 404
    return res.status(404).send('File not found');
  }

  // Only serve index.html for route requests (no file extension)
  res.sendFile(path.join(__dirname, 'dist/iprwc-e-commerce-frontend/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`App available at: http://localhost:${port}`);
});
