"use strict";

// Packages
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { ObjectID } = require("mongodb");
const { expect } = require("chai");

// Imports
const Reply = require("../models/reply");
const threadSchema = require("../models/thread");

// Constants
const saltRounds = 12;

// Main reply handler
function ReplyHandler() {
  
  // Handle retrieval of replies for each thread
  this.replyList = (req, res) => {
    const { board } = req.params;
    const { thread_id } = req.query;

    const Thread = mongoose.model("Thread", threadSchema, board);

    Thread.findById(
      thread_id,
      {
        reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0
      },
      (err, docs) => {
        expect(err, "thread find error").to.not.exist;
        res.json(docs);
      }
    );
  };

  // Handle new replies in threads
  this.newReply = (req, res) => {
    const { board } = req.params;
    const { text, thread_id, delete_password } = req.body;

    const Thread = mongoose.model("Thread", threadSchema, board);
    const hash = bcrypt.hashSync(delete_password, saltRounds);

    const reply = new Reply({
      text,
      created_on: new Date(),
      reported: false,
      delete_password: hash
    });

    // Add reply to thread
    Thread.findByIdAndUpdate(
      thread_id,
      {
        $inc: { replycount: 1 },
        $set: { bumped_on: new Date() },
        $push: { replies: reply }
      },
      { useFindAndModify: false },
      (err, doc) => res.redirect(`/b/${board}/${thread_id}`)
    );
  };

  // Report a reply
  this.reportReply = (req, res) => {
    const { board } = req.params;
    const { thread_id, reply_id } = req.body;

    const Thread = mongoose.model("Thread", threadSchema, board);

    // Find reply in thread and set reported to true
    Thread.findOneAndUpdate(
      {
        _id: new ObjectID(thread_id),
        replies: { $elemMatch: { _id: new ObjectID(reply_id) } }
      },
      { $set: { "replies.$.reported": true } },
      { useFindAndModify: false },
      (err, doc) => res.send(err ? "error reporting" : "reported")
    );
  };

  // Delete reply with valid password
  this.deleteReply = (req, res) => {
    const { board } = req.params;
    const { thread_id, reply_id, delete_password } = req.body;

    const Thread = mongoose.model("Thread", threadSchema, board);
    
    const a = Thread.findOne(
      {
        _id: new ObjectID(thread_id),
        replies: { $elemMatch: { _id: new ObjectID(reply_id) } }
      },
      { useFindAndModify: false },
      (err, doc) => expect(err, "password error").to.not.exist
    )
    
    
    // Retrieve stored hash
    Thread.findOne(
      {
        _id: new ObjectID(thread_id),
        replies: { $elemMatch: { _id: new ObjectID(reply_id) } }
      },
      { useFindAndModify: false },
      (err, doc) => expect(err, "password error").to.not.exist
    )

     // Then compare hashes
    .then(doc => {
      
      // Get index of reply
      let index;
      doc.replies.map((x, i) => { if (x._id == reply_id) index = i });
      
      // Get stored hash
      const hash = doc.replies[index].delete_password;
      
      bcrypt.compare(delete_password, hash, (err, match) => {
        if (!match) return res.send("incorrect password");
        
        // Set text to [deleted]
        Thread.findOneAndUpdate(
          {
            _id: new ObjectID(thread_id),
            replies: { $elemMatch: { _id: new ObjectID(reply_id) } }
          },
          { $set: { "replies.$.text": "[deleted]" } },
          { returnNewDocument: true, useFindAndModify: false },
          (err, doc) => res.send(err ? "deletion error" : "success")
        );
      });
    });
  };
}

module.exports = ReplyHandler;
