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
    it ('get /docs/we-core should show we-core doc index.md file', function(done) {
      request(http)
      .get('/docs/we-core')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        done();
      });
    });

    it ('get /docs/we-core/features should return features page', function(done) {
      request(http)
      .get('/docs/we-core/features')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        done();
      });
    });

    it ('get /docs/we-core/features.routes should return the feature route doc', function(done) {
      request(http)
      .get('/docs/we-core/features.routes')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        done();
      });
    });

    it ('get /docs/we-core/invalid.pageasdasda should return 404', function(done) {
      request(http)
      .get('/docs/we-core/invalid.pageasdasda')
      .expect(404)
      .end(function (err) {
        if (err) throw err;
        done();
      });
    });
  });

  describe('jsonRequest', function() {
    it ('get /docs/we-core should show we-core doc index.md file', function(done) {
      request(http)
      .get('/docs/we-core')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        assert(res.body.html);
        done();
      });
    });

    it ('get /docs/we-core/features should return features page', function(done) {
      request(http)
      .get('/docs/we-core/features')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        assert(res.text);
        assert(res.body.html);
        done();
      });
    });

    it ('get /docs/we-core/features.routes should return the feature route doc', function(done) {
      request(http)
      .get('/docs/we-core/features.routes')
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