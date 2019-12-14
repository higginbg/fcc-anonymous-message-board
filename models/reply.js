"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema for new issues
const Reply = new Schema({
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, required: true },
  delete_password: { type: String, required: true }
});

module.exports = mongoose.model("Reply", Reply);
