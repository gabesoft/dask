'use strict';

const Boom = require('boom');

function getBody(data) {
  const isModel = data && data.constructor.name === 'model',
        isMongoError = data.errmsg && (data.code === 11000 || data.code === 11001),
        isError = Boolean(data.errors);

  if (isMongoError) {
    return Object.assign({ isError: true }, data.toJSON());
  } else if (isError) {
    return Object.assign({ isError: true }, data);
  } else if (isModel) {
    return data.toObject();
  }

  return data;
}

function createdSuccess(request, reply) {
  return data => {
    const locationUrl = `${request.url.pathname}/${data.id}`;
    return reply(getBody(data)).created(locationUrl);
  };
}

function createdFailure(request, reply) {
  return err => {
    if (err.name === 'MongoError' && err.code === 11000) {
      reply(Boom.conflict(err.message, err));
    } else {
      reply(Boom.wrap(err.statusCode || 500, err.message, err));
    }
  };
}

function bulkCreatedSuccess(request, reply) {
  return data => {
    return reply(data.map(getBody));
  };
}

function bulkCreatedFailure(request, reply) {
  return err => {
    if (err.name === 'MongoError' && err.code === 11000) {
      reply(Boom.conflict(err.message, err));
    } else {
      reply(Boom.wrap(err.statusCode || 500, err.message, err));
    }
  };
}

function deletedFailure(request, reply) {
  return err => {
    reply(Boom.wrap(err.statusCode || 500, err.message, err));
  };
}

function replacedFailure(request, reply) {
  return err => {
    reply(Boom.wrap(err.statusCode || 500, err.message, err));
  };
}

function readSuccess(request, reply) {
  return data => {
    return data
      ? reply(getBody(data))
      : reply(Boom.notFound(request.params.id));
  };
}

function readFailure(request, reply) {
  return err => {
    reply(Boom.wrap(err.statusCode || 500, err.message, err));
  };
}

module.exports = {
  createdSuccess,
  createdFailure,
  bulkCreatedSuccess,
  bulkCreatedFailure,
  replacedSuccess: readSuccess,
  replacedFailure,
  updatedSuccess: readSuccess,
  updatedFailure: replacedFailure,
  deletedSuccess: readSuccess,
  deletedFailure,
  readSuccess,
  readFailure
};
