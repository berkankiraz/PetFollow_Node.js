const mongoose = require("mongoose");

// user schema
const AppliedSchema = new mongoose.Schema({
  
  AnimalId: {
    type: String,
  },
  WhatApplied: {
    type: String,
  },
  //   password field
  VaccineOfNewApply: {
    type: String,
  },
  ExaminationOfNewApply: {
    type: String,
  },
  NotesOfNewApply: {
    type: String,
  },
  DateOfNewApply: {
    type: String,
  }
 
});

// export UserSchema
module.exports = mongoose.model.Applied || mongoose.model("Applied", AppliedSchema);
