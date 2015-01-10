module.exports = function (schema, options) {
    schema.add({
        createdAt: { type: Date, default: Date.now }
      , updatedAt: { type: Date, default: Date.now }
    });

    schema.pre('save', function (next) {
        this.set('updatedAt', Date.now());
        next();
    });
};
