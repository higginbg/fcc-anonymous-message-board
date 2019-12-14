"use strict";

const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema for new issues
// Model created dynamically based on board
const Thread = new Schema({
  text: { type: String, required: true },
  board: { type: String, required: true },
  created_on: { type: Date, default: Date.now, required: true },
  bumped_on: { type: Date, default: Date.now, required: true },
  reported: { type: Boolean, default: false, required: true },
  delete_password: { type: String, required: true },
  replies: { type: [], required: true },
  replycount: { type: Number, required: true, default: 0 }
});

module.exports = Thread;
