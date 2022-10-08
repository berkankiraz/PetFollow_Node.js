const mongoose = require("mongoose");

// user schema
const PetSchema = new mongoose.Schema({
  // email field
  img: {
    name: String,
	desc: String,
    data: Buffer,
    contentType: String,
  },
  name: {
    type: String,
  },
  owner: {
    type: String,
  },
  //   password field
  age: {
    type: String,
  },
  race: {
    type: String,
  },
  sex: {
    type: String,
  },
  model: {
    type: String,
  },
  date: {
    type: String,
  }
 
});

// export UserSchema
module.exports = mongoose.model.Pets || mongoose.model("Pets", PetSchema);
