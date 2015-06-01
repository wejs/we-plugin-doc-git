var assert = require('assert');
var request = require('supertest');
var helpers = require('we-test-tools').helpers;
var stubs = require('we-test-tools').stubs;
var async = require('async');
var _ = require('lodash');
var http;
var we;
var agent;

describe('wejsdocsFeature', function() {
  before(function (done) {
    http = helpers.getHttp();
    agent = request.agent(http);
    we = helpers.getWe();
    we.config.acl.disabled = true;
    done();
  });

  describe('htmlRequest', function() {
    it ('get /docs/we should show we doc index.md file', function(done) {
      request(http)
      .get('/docs/we')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        done();
      });
    });

    it ('get /docs/we/features should return features page', function(done) {
      request(http)
      .get('/docs/we/features')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        done();
      });
    });

    it ('get /docs/we/features.routes should return the feature route doc', function(done) {
      request(http)
      .get('/docs/we/features.routes')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        done();
      });
    });

    it ('get /docs/we/invalid.pageasdasda should return 404', function(done) {
      request(http)
      .get('/docs/we/invalid.pageasdasda')
      .expect(404)
      .end(function (err) {
        if (err) throw err;
        done();
      });
    });
  });

  describe('jsonRequest', function() {
    it ('get /docs/we should show we doc index.md file', function(done) {
      request(http)
      .get('/docs/we')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        assert(res.body.html);
        done();
      });
    });

    it ('get /docs/we/features should return features page', function(done) {
      request(http)
      .get('/docs/we/features')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        assert(res.body.html);
        done();
      });
    });

    it ('get /docs/we/features.routes should return the feature route doc', function(done) {
      request(http)
      .get('/docs/we/features.routes')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        assert(res.body.html);
        done();
      });
    });
  });
});