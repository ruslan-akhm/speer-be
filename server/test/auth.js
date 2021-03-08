require("dotenv").config();
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
var connectDatabase = require("../database");

//Assertion style
chai.should();

chai.use(chaiHttp);

describe("auth  API", () => {
  before("connect", function (done) {
    connectDatabase()
      .then(done)
      .catch(err => done(err)); //return mongoose.connect(process.env.DATABASE);
  });

  /* test register */
  /* test login */

  describe("POST /api/auth/login", () => {
    //successful login with existing email
    it("should receive cookie and object", done => {
      const credentials = {
        email: "rus1@lan.com",
        password: "123456",
      };
      chai
        .request(server)
        .post("/api/auth/login")
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(201);
          res.should.be.a("object");
          done();
        });
    });

    //UNsuccessful login with NON-existing email
    it("should NOT receive cookie and object", done => {
      const credentials = {
        email: "xyz1234567890@xyz.com",
        password: "123456",
      };
      chai
        .request(server)
        .post("/api/auth/login")
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.a("object");
          done();
        });
    });
  });

  /* test logout */

  describe("GET /api/auth/logout", () => {
    it("should return object and status 200", done => {
      chai
        .request(server)
        .get("/api/auth/logout")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("status");
          done();
        });
    });
  });
});
