import request from 'superagent';

exports.resource = function(method, url, data) {

  return new Promise((resolve, reject) => {
    if (method === 'GET') {

      request
        .get(url)
        .end(function(err, res) {
          if (err) reject(err);
          else resolve(res.body);
        });

    } else if (method === 'POST') {

      request
        .post(url)
        .send(data)
        .end(function(err, res) {
          if (err) reject(err);
          else resolve(res.body);
        });

    } else if (method === 'PUT') {

      request
        .put(url)
        .send(data)
        .end(function(err, res) {
          if (err) reject(err);
          else resolve(res.body);
        });

    } else if (method === 'DELETE') {

      request
        .delete(url)
        .send(data)
        .end(function(err, res) {
          if (err) reject(err);
          else resolve(res.body);
        });
    }
  });
};