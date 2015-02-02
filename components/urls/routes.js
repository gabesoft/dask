var handler = require('./handlers');

module.exports = [{
    method  : 'POST'
  , path    : '/users/{userId}/urls'
  , handler : handler.create
}, {
    method  : [ 'PUT', 'PATCH' ]
  , path    : '/users/{userId}/urls/{id}'
  , handler : handler.update
}, {
    method  : 'DELETE'
  , path    : '/users/{userId}/urls/{id}'
  , handler : handler.remove
}];
