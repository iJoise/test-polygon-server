const userService = require('../service/user-service');
const {validationResult, query} = require('express-validator')
const ApiError = require('../exception/api-error')
const getRandomInt = require('../utils/index')

class UserController {
   async registration(req, res, next) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
         }
         const {email, password, name, surname, phone} = req.body;
         const userData = await userService.registration(email, password, name, surname, phone);
         res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
         return res.json(userData);
      } catch (err) {
         next(err);
      }
   }

   async login(req, res, next) {
      try {
         const {email, password} = req.body;
         const userData = await userService.login(email, password);
         res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
         return res.json(userData);
      } catch (err) {
         next(err);
      }
   }

   async logout(req, res, next) {
      try {
         const {refreshToken} = req.cookies;
         const token = await userService.logout(refreshToken);
         res.clearCookie('refreshToken');
         return res.json(token);
      } catch (err) {
         next(err);
      }
   }

   async activate(req, res, next) {
      try {
         const activationLink = req.params.link
         await userService.activate(activationLink);
         return res.redirect(process.env.CLIENT_URL)
      } catch (err) {
         next(err);
      }
   }

   async refresh(req, res, next) {
      try {
         const {refreshToken} = req.cookies;
         const userData = await userService.refresh(refreshToken);
         res.cookie('refreshToken', userData.refreshToken, {maxAge: 15 * 24 * 60 * 60 * 1000, httpOnly: true});
         return res.json(userData);
      } catch (err) {
         next(err);
      }
   }

   async getUsers(req, res, next) {
      try {
         const users = await userService.getAllUsers();
         return res.json(users);
      } catch (err) {
         next(err);
      }
   }

   async getRandom(req, res, next) {
      try {
         const result = {
            first: getRandomInt(+req.query.first || 100),
            second: getRandomInt(+req.query.second || 100),
            third: getRandomInt(+req.query.third || 100),
         }
         return res.json(result)
      } catch(err) {
         next(err);
      }
   }
}

module.exports = new UserController();
