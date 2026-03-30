const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// Proxy API requests to the Java backend running on localhost:8080
app.use('/api', createProxyMiddleware({ 
    target: 'http://localhost:8080', 
    changeOrigin: true 
}));

// Serve React static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

app.use(function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Production server running on http://localhost:${PORT}`);
});
