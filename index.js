const url         = require('url');
const http        = require('http');
const https       = require('https');
const express = require('express');

const app = express();

app.get('/image', function (req, res) {
    var parts = url.parse(req.url, true);
    var imageUrl = encodeURI(parts.query.url);

    parts = url.parse(imageUrl);

    var filename = parts.pathname.split("/").pop();

    var options = {
        port: (parts.protocol === "https:" ? 443 : 80),
        host: parts.hostname,
        method: 'GET',
        path: parts.path,
        accept: '*/*'
    };

    var request = (options.port === 443 ? https.request(options) : http.request(options));

    request.addListener('response', function (proxyResponse) {
        var offset = 0;
        var contentLength = parseInt(proxyResponse.headers["content-length"], 10);
        var body = new Buffer(contentLength);

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

app.listen('8000', '0.0.0.0');