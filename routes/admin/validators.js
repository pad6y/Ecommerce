const { check } = require('express-validator');
const usersRepo = require('../../repo/users');

module.exports = {
  requireTitle: check('title')
    .trim()
    .isLength({ min: 5, max: 40 })
    .withMessage('Must be 5 - 40 characters long'),
  requirePrice: check('price')
    .trim()
    .toFloat()
    .isFloat({ min: 1 })
    .withMessage('Value must be at least 1'),
  requireEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid Email')
    .custom(async (email) => {
      const userExists = await usersRepo.getOneBy({ email: email });
      if (userExists) {
        throw new Error('Email is already in use');
      }
    }),
  requirePassword: check('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password needs to be between 4 and 20 characters'),
  requirePasswordConfirmation: check('passwordConfirmation')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password needs to be between 4 and 20 characters')
    .custom(async (passwordConfirmation, { req }) => {
      if (req.body.password !== passwordConfirmation) {
        throw new Error('Passwords do not match');
      }
    }),
  requireEmailExists: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Check your email and try again.')
    .custom(async (email) => {
      const user = await usersRepo.getOneBy({ email });
      if (!user) throw new Error('Please check your email');
    }),
  requireValidPassword: check('password')
    .trim()
    .custom(async (password, { req }) => {
      const user = await usersRepo.getOneBy({ email: req.body.email });
      if (!user) throw new Error('Invalid Password');

      const authenticated = await usersRepo.comparePasswords(
        user.password,
        password
      );

      if (!authenticated) {
        throw new Error('Invalid Password');
      }
    }),
};
