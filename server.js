const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function resolveFilePath(requestUrl) {
    if (requestUrl === '/' || requestUrl === '') {
        return path.join(PUBLIC_DIR, 'index.html');
    }

    const cleaned = decodeURIComponent(requestUrl.split('?')[0]);
    const normalized = path.normalize(cleaned).replace(/^\/+/, '');
    return path.join(PUBLIC_DIR, normalized);
}

const server = http.createServer((req, res) => {
    const filePath = resolveFilePath(req.url || '/');

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        stream.on('error', () => {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('500 Internal Server Error');
        });
    });
});

server.listen(PORT, () => {
    console.log(`静态服务已启动：http://localhost:${PORT}`);
});
