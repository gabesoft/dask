var User = require('./user-model');

function create (request, reply) {
    var data = request.payload
      , user = User.create(data);

    user.save(function (err) {
        if (err) {
            // TODO: handle error
        } else {
            reply(user.toObject());
        }
    });
}
module.exports = {
    create : create
  , read   : read
  , update : update
  , delete : delete
};
