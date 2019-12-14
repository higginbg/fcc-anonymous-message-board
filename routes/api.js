/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { expect } = require("chai");

const ThreadHandler = require("../controllers/threadHandler.js");
const ReplyHandler = require("../controllers/replyHandler.js");

// Connect to db
const mongoose = require("mongoose");
mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

module.exports = app => {
  const threadHandler = new ThreadHandler();
  const replyHandler = new ReplyHandler();

  app
    .route("/api/threads/:board")
    .get(threadHandler.threadList)
    .post(threadHandler.newThread)
    .put(threadHandler.reportThread)
    .delete(threadHandler.deleteThread);

  app
    .route("/api/replies/:board")
    .get(replyHandler.replyList)
    .post(replyHandler.newReply)
    .put(replyHandler.reportReply)
    .delete(replyHandler.deleteReply);
};
