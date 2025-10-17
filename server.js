const express = require('express');
const path = require('path');
const app = express();

const distFolder = path.join(__dirname, 'dist/iprwc-ecommerce-frontend');

console.log('Serving static files from:', distFolder);

// Serve static files FIRST with proper MIME types
app.use(express.static(distFolder, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// Handle Angular routing - serve index.html for non-file requests
app.get('*', (req, res) => {
  console.log('Request path:', req.path);

  // If it looks like a static file request that wasn't found, return 404
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    console.log('Static file not found:', req.path);
    return res.status(404).send('File not found');
  }

  // Serve index.html for all route requests
  const indexPath = path.join(distFolder, 'index.html');
  console.log('Serving index.html for route:', req.path);
  res.sendFile(indexPath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Serving from: ${distFolder}`);
});
