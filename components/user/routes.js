'use strict';

var handler = require('./handlers')
  , Joi     = require('joi');

module.exports = [{
    method  : 'POST'
  , path    : '/user'
  , handler : handler.create
}, {
    method  : 'PUT'
  , path    : '/user'
  , handler : handler.update
  , validate : {
        payload: {
            id : Joi.string().required()
        }
    }
}, {
    method  : 'GET'
  , path    : '/user/{id}'
  , handler : handler.read
}, {
    method  : 'DELETE'
  , path    : '/user/{id}'
  , handler : handler.delete
}];
