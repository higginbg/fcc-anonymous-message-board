/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const server = require("../server");

const { assert } = chai;

chai.use(chaiHttp);

suite("Functional Tests", () => {
  let testText = Math.floor(Math.random() * 10000000);
  let testThreadId1; //_id of thread 1 created
  let testThreadId2; //_id of thread 2 created
  let testReplyId; //_id of reply created

  suite("API ROUTING FOR /api/threads/:board", () => {
    suite("POST", () => {
      test("create 2 new threads(because we end up deleting 1 in the delete test)", done => {
        chai
          .request(server)
          .post("/api/threads/fcc")
          .send({ text: testText, delete_password: "thread_pass" })
          .end((err, res) => assert.equal(res.status, 200));

        chai
          .request(server)
          .post("/api/threads/fcc")
          .send({ text: testText, delete_password: "thread_pass" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite("GET", () => {
      test("most recent 10 threads with most recent 3 replies each", done => {
        chai
          .request(server)
          .get("/api/threads/fcc")
          .end((err, res) => {
            const { status, body } = res;
            assert.equal(status, 200);
            assert.isArray(body);
            assert.isBelow(body.length, 11);
            assert.property(body[0], "_id");
            assert.property(body[0], "text");
            assert.property(body[0], "board");
            assert.property(body[0], "created_on");
            assert.property(body[0], "bumped_on");
            assert.property(body[0], "replies");
            assert.property(body[0], "replycount");
            assert.notProperty(body[0], "reported");
            assert.notProperty(body[0], "delete_password");
            assert.isArray(body[0].replies);
            assert.isBelow(body[0].replies.length, 4);
            testThreadId1 = body[0]._id;
            testThreadId2 = body[1]._id;
            done();
          });
      });
    });

    suite("DELETE", () => {
      test("delete thread with good password", done => {
        chai
          .request(server)
          .delete("/api/threads/fcc")
          .send({ thread_id: testThreadId1, delete_password: "thread_pass" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });

      test("delete thread with bad password", done => {
        chai
          .request(server)
          .delete("/api/threads/fcc")
          .send({ thread_id: testThreadId2, delete_password: "wrong" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
    });

    suite("PUT", () => {
      test("report thread", done => {
        chai
          .request(server)
          .put("/api/threads/fcc")
          .send({ report_id: testThreadId2 })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", () => {
    suite("POST", () => {
      test("reply to thread", done => {
        chai
          .request(server)
          .post("/api/replies/fcc")
          .send({
            thread_id: testThreadId2,
            text: `a reply ${testText}`,
            delete_password: "reply_pass"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite("GET", () => {
      test("Get all replies for 1 thread", done => {
        chai
          .request(server)
          .get("/api/replies/fcc")
          .query({ thread_id: testThreadId2 })
          .end((err, res) => {
            const { status, body } = res;
            assert.equal(status, 200);
            assert.property(body, "_id");
            assert.property(body, "text");
            assert.property(body, "board");
            assert.property(body, "created_on");
            assert.property(body, "bumped_on");
            assert.property(body, "replies");
            assert.property(body, "replycount");
            assert.notProperty(body, "delete_password");
            assert.notProperty(body, "reported");
            assert.isArray(body.replies);
            assert.property(body.replies[0], "text");
            assert.property(body.replies[0], "created_on");
            assert.notProperty(body.replies[0], "delete_password");
            assert.notProperty(body.replies[0], "reported");
            assert.equal(
              body.replies[body.replies.length - 1].text,
              `a reply ${testText}`
            );
            testReplyId = body.replies[0]._id;
            done();
          });
      });
    });

    suite("PUT", () => {
      test("report reply", done => {
        chai
          .request(server)
          .put("/api/replies/fcc")
          .send({ thread_id: testThreadId2, reply_id: testReplyId })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });

    suite("DELETE", () => {
      test("delete reply with bad password", done => {
        chai
          .request(server)
          .delete("/api/replies/fcc")
          .send({
            thread_id: testThreadId2,
            reply_id: testReplyId,
            delete_password: "wrong"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });

      test("delete reply with valid password", done => {
        chai
          .request(server)
          .delete("/api/replies/fcc")
          .send({
            thread_id: testThreadId2,
            reply_id: testReplyId,
            delete_password: "reply_pass"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });
  });
});
