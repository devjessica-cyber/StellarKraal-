'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
var Promise;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function(db) {
  var filePath = path.join(__dirname, 'sqls', '20260425000000-initial-schema-up.sql');
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function(data) {
    return db.runSql(data);
  }).then(function() {
    return db.runSql(
      'CREATE TABLE IF NOT EXISTS webhook_delivery_attempts (' +
      'id SERIAL PRIMARY KEY, ' +
      'webhook_id INTEGER, ' +
      'attempt_number INTEGER NOT NULL, ' +
      'status VARCHAR(32) NOT NULL, ' +
      'response_code INTEGER, ' +
      'latency_ms INTEGER, ' +
      'error TEXT, ' +
      'created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()' +
      ');'
    );
  }).then(function() {
    return db.runSql(
      'CREATE TABLE IF NOT EXISTS dead_letter_webhooks (' +
      'id SERIAL PRIMARY KEY, ' +
      'webhook_id INTEGER, ' +
      'url TEXT NOT NULL, ' +
      'payload JSONB NOT NULL, ' +
      'attempts INTEGER NOT NULL DEFAULT 0, ' +
      'last_response_code INTEGER, ' +
      'last_error TEXT, ' +
      'replayed_at TIMESTAMP WITH TIME ZONE, ' +
      'created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()' +
      ');'
    );
  });
};

exports.down = function(db) {
  var filePath = path.join(__dirname, 'sqls', '20260425000000-initial-schema-down.sql');
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  }).then(function(data) {
    return db.runSql(data);
  }).then(function() {
    return db.runSql('DROP TABLE IF EXISTS dead_letter_webhooks;');
  }).then(function() {
    return db.runSql('DROP TABLE IF EXISTS webhook_delivery_attempts;');
  });
};

exports._meta = {
  version: 1
};
