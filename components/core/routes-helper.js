'use strict';

'use strict';

const MAX_BYTES = 104857600,
      Joi = require('./joi');

function makeCrudRoutes(path, handlers, validate) {
  validate = validate || {};
  return [{
    method: 'GET',
    path: `${path}/{id}`,
    config: {
      handler: handlers.read,
      validate: Object.assign({ params: { id: Joi.objectId() } }, validate.read || {})
    }
  }, {
    method: 'POST',
    path: `${path}`,
    config: {
      handler: handlers.create,
      validate: Object.assign({ payload: Joi.object() }, validate.create || {})
    }
  }, {
    method: 'PUT',
    path: `${path}/{id}`,
    config: {
      handler: handlers.replace,
      validate: Object.assign({ params: { id: Joi.objectId() } }, validate.replace || {})
    }
  }, {
    method: 'PATCH',
    path: `${path}/{id}`,
    config: {
      handler: handlers.update,
      validate: Object.assign({ params: { id: Joi.objectId() } }, validate.update || {})
    }
  }, {
    method: 'DELETE',
    path: `${path}/{id}`,
    config: {
      handler: handlers.remove,
      validate: Object.assign({ params: { id: Joi.objectId() } }, validate.remove || {})
    }
  }];
}

function makeSearchRoutes(path, handlers) {
  return [{
    method: 'GET',
    path: `/search${path}`,
    handler: handlers.searchViaGet || handlers.search
  }, {
    method: 'POST',
    path: `/search${path}`,
    config: {
      handler: handlers.searchViaPost || handlers.search,
      validate: {
        payload: Joi.object().keys({
          query: Joi.object(),
          fields: [Joi.array().items(Joi.string()), Joi.object(), Joi.string()],
          sort: [Joi.array().items([Joi.string(), Joi.object()]), Joi.object(), Joi.string()],
          skip: Joi.number().min(0).integer(),
          from: Joi.number().min(0).integer(),
          limit: Joi.number().min(0).integer(),
          size: Joi.number().min(0).integer()
        }).without('skip', 'from').without('limit', 'size')
      }
    }
  }];
}

function makeBulkRoutes(path, handlers) {
  return [{
    method: 'POST',
    path: `/bulk${path}`,
    config: {
      handler: handlers.bulkCreate,
      validate: { payload: Joi.array() },
      payload: { maxBytes: MAX_BYTES }
    }
  }, {
    method: 'PUT',
    path: `/bulk${path}`,
    config: {
      handler: handlers.bulkReplace,
      validate: { payload: Joi.array() },
      payload: { maxBytes: MAX_BYTES }
    }
  }, {
    method: 'PATCH',
    path: `/bulk${path}`,
    config: {
      handler: handlers.bulkUpdate,
      validate: { payload: Joi.array() },
      payload: { maxBytes: MAX_BYTES }
    }
  }, {
    method: 'DELETE',
    path: `/bulk${path}`,
    config: {
      handler: handlers.bulkRemove,
      validate: { payload: Joi.array().items(Joi.objectId()) }
    }
  }];
}

module.exports = {
  makeBulkRoutes,
  makeCrudRoutes,
  makeSearchRoutes
};
