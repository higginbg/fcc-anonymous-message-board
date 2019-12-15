/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const ThreadHandler = require("../controllers/threadHandler");
const ReplyHandler = require("../controllers/replyHandler");

// Connect to db
const mongoose = require("mongoose");
mongoose.connect(process.env.DB, { useUnifiedTopology: true, useNewUrlParser: true });

module.exports = app => {
  
  const { threadList, threadNew, threadReport, threadDelete } = new ThreadHandler();
  const { replyList, replyNew, replyReport, replyDelete, } = new ReplyHandler();

  app
    .route("/api/threads/:board")
    .get(threadList)
    .post(threadNew)
    .put(threadReport)
    .delete(threadDelete);

  app
    .route("/api/replies/:board")
    .get(replyList)
    .post(replyNew)
    .put(replyReport)
    .delete(replyDelete);
};
