const http = require('http');
const urlMod = require('url');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

app.all('*', function (req, res) {
  const { method, url, body, headers } = req;
  const urlObj = urlMod.parse(url);
  const signedUrl = `${urlObj.path}`;
  const secretKey = headers['x-secret-key'];
  const time = +new Date();

  const content = `${secretKey}\n${method.toUpperCase()}\n${signedUrl}\n${JSON.stringify(body)}\n${time}`;
  const checksum = crypto
    .createHash('sha256')
    .update(content)
    .digest('hex');

  const axiosHeaders = Object.assign({}, headers, {
    'x-time': time,
    'x-checksum': checksum,
  });

  delete axiosHeaders['x-api-key'];
  delete axiosHeaders['x-secret-key'];

  let task = null;
  switch (method) {
    case 'GET':
      task = axios({
        method: 'get',
        url,
        data: body,
        headers: axiosHeaders,
      });
      break;

    case 'POST':
      task = axios({
        method: 'post',
        url,
        data: body,
        headers: axiosHeaders,
      });
      break;

    case 'PUT':
      task = axios({
        method: 'put',
        url,
        data: body,
        headers: axiosHeaders,
      });
      break;

    case 'DELETE':
      task = axios({
        method: 'delete',
        url,
        data: body,
        headers: axiosHeaders,
      });
      break;
  }

  const processResponse = (response) => {
    res.status(response.status);
    const headers = response.headers;
    for (const key in headers) {
      if (key === 'connection') {
        continue;
      }

      res.setHeader(key, headers[key]);
    }

    res.send(response.data);

    res.end();
  };

  task
    .then(response => {
      processResponse(response);
    })
    .catch(error => {
      const response = error.response;
      processResponse(response);
    });

});

const server = http.createServer(app);
console.log('Proxy is listening on port 5050');

server.listen(5050);
