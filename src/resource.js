exports.resource = function(method, url, data) {

  var defer = Q.defer();

  if (method === 'GET') {

    request
      .get(url)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });

  } else if (method === 'POST') {

    request
      .post(url)
      .send(data)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });

  } else if (method === 'PUT') {

    request
      .put(url)
      .send(data)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });

  } else if (method === 'DELETE') {

    request
      .delete(url)
      .send(data)
      .end(function(err, res) {
        if (err) defer.reject(err);
        else defer.resolve(res.body);
      });
  }
  return defer.promise;
};