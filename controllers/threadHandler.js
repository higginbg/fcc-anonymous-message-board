"use strict";

// Packages
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { expect } = require("chai");

// Imports
const threadSchema = require("../models/thread");

// Constants
const saltRounds = 12;

// Main thread handler
function ThreadHandler() {
  
  // Retrieve thread list for board
  this.threadList = (req, res) => {
    const { board } = req.params;

    const Thread = mongoose.model("Thread", threadSchema, board);

    Thread.find(
      { board },
      {
        reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0
      },
      {
        sort: { bumped_on: -1 },
        limit: 10
      },
      (err, docs) => {
        expect(err, "thread find error").to.not.exist;
        const result = [];
        for (const doc of docs) {
          if (doc.replycount > 3) {
            doc.replies = doc.replies.slice(-3);
          }
          result.push(doc);
        }
        res.json(result);
      }
    );
  };

  // Handle posting new thread
  this.newThread = (req, res) => {
    const { board } = req.params;
    const { text, delete_password } = req.body;

    const Thread = mongoose.model("Thread", threadSchema, board);
    const hash = bcrypt.hashSync(delete_password, saltRounds);

    const newThread = new Thread({
      text,
      board,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: hash,
      replies: [],
      replycount: 0
    });

    // Create the thread
    Thread.create(newThread, (err, doc) => {
      expect(err, "create thread error").to.not.exist;
      res.redirect(`/b/${board}/`);
    });
  };

  // Report a thread
  this.reportThread = (req, res) => {
    const { board } = req.params;
    const { thread_id } = req.body;

    const Thread = mongoose.model("Thread", threadSchema, board);

    Thread.findByIdAndUpdate(
      thread_id,
      { $set: { reported: true } },
      { useFindAndModify: false },
      (err, doc) => {
        expect(err, "report thread error").to.not.exist;
        return res.send("reported");
      }
    );
  };

  // Delete a thread with valid password
  this.deleteThread = (req, res) => {
    const { board } = req.params;
    const { thread_id, delete_password } = req.body;

    const Thread = mongoose.model("Thread", threadSchema, board);

    // Retrieve stored hash
    Thread.findById(
      thread_id,
      "delete_password -_id",
      (err, doc) => expect(err, "password error").to.not.exist
    )

      // Then compare hashes
      .then(doc => {
        const hash = doc.delete_password;
        bcrypt.compare(delete_password, hash, (err, match) => {
          if (!match) {
            return res.send("incorrect password");
          } else {
            Thread.findByIdAndDelete(thread_id, (err, doc) => {
              expect(err, "thread not found").to.not.exist;
              return res.send("success");
            });
          }
        });
      });
  };
}

module.exports = ThreadHandler;
