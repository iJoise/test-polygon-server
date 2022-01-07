const {Schema, model} = require("mongoose");


const UserSchema = new Schema({
   email: {type: String, unique: true, required: true},
   password: {type: String, required: true},
   name: {type: String, required: true},
   surname: {type: String, required: true},
   phone: {type: String, required: true, unique: true},
   isActivated: {type: Boolean, default: false},
   activationLink: {type: String},
})

module.exports = model('User', UserSchema)