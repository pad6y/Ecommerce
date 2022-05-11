const { validationResult } = require('express-validator');

module.exports = {
  handleErrors(templateFn, dataCb) {
    return async (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        let data = {};
        if (dataCb) {
          data = await dataCb(req);
        }
        return res.send(templateFn({ errors, ...data }));
      }
      next();
    };
  },
  auth(req, res, next) {
    if (!req.session.userId) {
      return res.redirect('/signin');
    }
    next();
  },
};
