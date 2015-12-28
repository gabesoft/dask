'use strict';

const Boom = require('boom'),
      errors = require('mongoose/lib/error');

function getBody(data) {
  const isModel = data && data.constructor.name === 'model',
        isMongoError = data && data.errmsg && (data.code === 11000 || data.code === 11001),
        isError = Boolean(data && data.errors),
        isErrorType = data instanceof Error;

  if (isMongoError) {
    return Object.assign({ isError: true }, data.toJSON());
  } else if (isError) {
    return Object.assign({ isError: true }, data);
  } else if (isErrorType) {
    return Object.assign({ isError: true }, { message: data.message });
  } else if (isModel) {
    return data.toObject();
  }

  return data;
}

function processError(reply, err) {
  if (err.name === 'MongoError' && err.code === 11000) {
    return reply(Boom.conflict(err.message, err));
  } else if (err instanceof errors.ValidationError) {
    const message = Object
            .keys(err.errors)
            .map(key => err.errors[key].message)
            .join(' ');
    return reply(Boom.badRequest(message, err));
  } else if (err instanceof errors.CastError) {
    return reply(Boom.badRequest(err.message, err));
  } else {
    return reply(Boom.wrap(err, err.statusCode || 500, err.message));
  }
}

function createdSuccess(request, reply) {
  return data => {
    const locationUrl = `${request.url.pathname}/${data.id || data._id}`;
    return reply(getBody(data)).created(locationUrl);
  };
}

function createdFailure(request, reply) {
  return err => processError(reply, err);
}

function bulkCreatedSuccess(request, reply) {
  return data => {
    return reply(data.map(getBody));
  };
}

function bulkCreatedFailure(request, reply) {
  return err => processError(reply, err);
}

function removedFailure(request, reply) {
  return err => processError(reply, err);
}

function replacedFailure(request, reply) {
  return err => processError(reply, err);
}

function readSuccess(request, reply) {
  return data => {
    return data
      ? reply(getBody(data))
      : reply(Boom.notFound(request.params.id));
  };
}

function readFailure(request, reply) {
  return err => processError(reply, err);
}

function searchSuccess(request, reply) {
  return data => reply(data.map(getBody));
}

function searchFailure(request, reply) {
  return err => processError(reply, err);
}

module.exports = {
  createdSuccess,
  createdFailure,
  bulkCreatedSuccess,
  bulkCreatedFailure,
  bulkReplacedSuccess: bulkCreatedSuccess,
  bulkReplacedFailure: bulkCreatedFailure,
  bulkUpdatedSuccess: bulkCreatedSuccess,
  bulkUpdatedFailure: bulkCreatedFailure,
  bulkRemovedSuccess: bulkCreatedSuccess,
  bulkRemovedFailure: bulkCreatedFailure,
  replacedSuccess: readSuccess,
  replacedFailure,
  updatedSuccess: readSuccess,
  updatedFailure: replacedFailure,
  removedSuccess: readSuccess,
  removedFailure,
  searchSuccess,
  searchFailure,
  readSuccess,
  readFailure,
  decorate: (method, name) => {
    return (request, reply) => {
      return method(request, reply).then(
        module.exports[`${name}Success`](request, reply),
        module.exports[`${name}Failure`](request, reply));
    };
  }
};
