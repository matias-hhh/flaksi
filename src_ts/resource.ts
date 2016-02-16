import request from 'superagent';
import {Observable} from 'rx';
import {Method} from './data-types';

export default function(method: Method, url: string, data: any=undefined) {

  return Observable.create((observer) => {
    if (method === Method.GET) {

      request
        .get(url)
        .end(function(err, res) {
          if (err) observer.onError(err);
          else observer.onNext(res.body);
        });

    } else if (method === Method.POST) {

      request
        .post(url)
        .send(data)
        .end(function(err, res) {
          if (err) observer.onError(err);
          else observer.onNext(res.body);
        });

    } else if (method === Method.PUT) {

      request
        .put(url)
        .send(data)
        .end(function(err, res) {
          if (err) observer.onError(err);
          else observer.onNext(res.body);
        });

    } else if (method === Method.DELETE) {

      request
        .delete(url)
        .send(data)
        .end(function(err, res) {
          if (err) observer.onError(err);
          else observer.onNext(res.body);
        });
    }
  });
};