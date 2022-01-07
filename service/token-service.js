const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
   generateToken(payload) {
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '10m'});
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '15d'});
      return {
         accessToken,
         refreshToken
      }
   }

   validateAccessToken(token) {
      try {
         return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      } catch(err) {
         return null;
      }
   }
   validateRefreshToken(token) {
      try {
         return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      } catch(err) {
         return null;
      }
   }

   async saveToken(userId, refreshToken) {
      const tokenData = await tokenModel.findOne({user: userId});
      if (tokenData) {
         tokenData.refreshToken = refreshToken;
         return tokenData.save();
      }
      const token = await tokenModel.create({user: userId, refreshToken});
      return token;
   }

   async removeToken(refreshToken) {
      const tokenData = await tokenModel.deleteOne({refreshToken});
      return tokenData;
   }

   async findToken(refreshToken) {
      const tokenData = await tokenModel.findOne({refreshToken});
      return tokenData;
   }
}


module.exports = new TokenService()