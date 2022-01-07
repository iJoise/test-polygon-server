module.exports = class UserDto {
   email;
   id;
   isActivated;
   name;
   surname;
   phone;

   constructor(model) {
      this.email = model.email;
      this.id = model._id;
      this.isActivated = model.isActivated;
      this.name = model.name;
      this.surname = model.surname;
      this.phone = model.phone;
   }
}