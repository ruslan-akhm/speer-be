require("dotenv").config();
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let connectDatabase = require("../database");
let User = require("../models/User");

//Assertion style
chai.should();

chai.use(chaiHttp);

describe("auth  API", () => {
  before("connect", function (done) {
    connectDatabase()
      .then(done)
      .catch(err => done(err));
  });

  /* POST  -  test REGISTER */

  describe("POST /api/auth/register", () => {
    //Clean up database after testing successful registering of a new user
    afterEach(async () => {
      await User.findOneAndDelete({ username: "polarbear" });
    });

    //successful register
    it("should receive cookie and object", done => {
      //registering new username
      const credentials = {
        username: "polarbear",
        password: "123456",
      };
      chai
        .request(server)
        .post("/api/auth/register")
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(201);
          res.should.be.a("object");
          done();
        });
    });

    //UNsuccessful register - username exists
    it("should NOT receive cookie and object", done => {
      //registering already existing username
      const credentials = {
        username: "ruslan",
        password: "123456",
      };
      chai
        .request(server)
        .post("/api/auth/register")
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.a("object");
          done();
        });
    });

    //UNsuccessful register - Validation fail
    it("should NOT receive cookie and object", done => {
      //registering username with password validation fail
      const credentials = {
        username: "newpolarbear",
        password: "12",
      };
      chai
        .request(server)
        .post("/api/auth/register")
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(400);
          res.should.be.a("object");
          done();
        });
    });
  });

  /* POST  -  test LOGIN */

  describe("POST /api/auth/login", () => {
    //successful login with existing username
    it("should receive cookie and object", done => {
      const credentials = {
        username: "ruslan",
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

    //UNsuccessful login with NON-existing username
    it("should NOT receive cookie and object", done => {
      const credentials = {
        username: "newuserthatdoesntexist",
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

  /* GET  -  test LOGOUT */

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
