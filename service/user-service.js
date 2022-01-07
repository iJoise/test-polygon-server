const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exception/api-error')

class UserService {
   async registration(email, password, name, surname, phone) {
      const candidateEmail = await UserModel.findOne({email});
      if (candidateEmail) {
         throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
      }
      const candidatePhone = await UserModel.findOne({phone})
      if (candidatePhone) {
         throw ApiError.BadRequest(`Пользователь с номером ${phone} уже существует`);
      }
      const hashPassword = await bcrypt.hash(password, 3);
      const activationLink = uuid.v4();

      const user = await UserModel.create({email, password: hashPassword, activationLink, name, surname, phone});
      await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

      const userDto = new UserDto(user);
      const tokens = tokenService.generateToken({...userDto});
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return {...tokens, user: userDto};
   }

   async activate(activationLink) {
      const user = await UserModel.findOne({activationLink});
      if (!user) {
         throw ApiError.BadRequest('Некорректная ссылка активации');
      }
      user.isActivated = true
      await user.save();
   }

   async login(email, password) {
      const user = await UserModel.findOne({email});
      if (!user) {
         throw ApiError.BadRequest('Пользователь с таким email не найден');
      }
      const isPassEquals = await bcrypt.compare(password, user.password);
      if (!isPassEquals) {
         throw  ApiError.BadRequest('Неверный email или пароль');
      }
      const userDto = new UserDto(user);
      const tokens = tokenService.generateToken({...userDto});

      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {...tokens, user: userDto};
   }

   async logout(refreshToken) {
      return await tokenService.removeToken(refreshToken);
   }

   async refresh(refreshToken) {
      if (!refreshToken) {
         throw ApiError.UnauthorizedError();
      }
      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);

      if (!userData || !tokenFromDb) {
         throw ApiError.UnauthorizedError();
      }
      const user = await UserModel.findById(userData.id);
      const userDto = new UserDto(user);
      const tokens = tokenService.generateToken({...userDto});

      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {...tokens, user: userDto};
   }

   async getAllUsers() {
      const users = await UserModel.find();
      return users;
   }
}

module.exports = new UserService();