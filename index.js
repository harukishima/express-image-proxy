const url         = require('url');
const http        = require('http');
const https       = require('https');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Call /image with image url query parameter');
});

app.get('/image', function (req, res) {
    let parts = url.parse(req.url, true);
    const imageUrl = encodeURI(parts.query.url);

    parts = url.parse(imageUrl);

    const filename = parts.pathname.split("/").pop();

    const options = {
        port: (parts.protocol === "https:" ? 443 : 80),
        host: parts.hostname,
        method: 'GET',
        path: parts.path,
        accept: '*/*'
    };

    const request = (options.port === 443 ? https.request(options) : http.request(options));

    request.addListener('response', function (proxyResponse) {
        let offset = 0;
        const contentLength = parseInt(proxyResponse.headers["content-length"], 10);
        const body = new Buffer(contentLength);

        proxyResponse.setEncoding('binary');
        proxyResponse.addListener('data', function(chunk) {
            body.write(chunk, offset, "binary");
            offset += chunk.length;
        }); 

        proxyResponse.addListener('end', function() {
            res.contentType(filename);
            res.write(body);
            res.end();            
        });
    });

    request.end();
});

const port = process.env.PORT || '8000';

app.listen(port, '0.0.0.0', () => {
  console.log('Server is running at ' + port);
});