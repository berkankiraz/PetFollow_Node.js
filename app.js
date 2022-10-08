const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// require database connection
const dbConnect = require("./Db/Dbconnection");
const User = require("./Models/UserModel");
const Post = require("./Models/PetModel");
const Applied = require("./Models/Applied");
const auth = require("./auth");
const fs = require("fs");
const multer = require("multer");

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.set("view engine", "ejs");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });
// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

// app.post("/uploadphoto", upload.single("myImage"), (req, res) => {
//   var img = fs.readFileSync(req.file.path);
//   var encode_img = img.toString("base64");
//   var final_img = {
//     contentType: req.file.mimetype,
//     image: new Buffer(encode_img, "base64"),
//   };
//   imageModel.create(final_img, function (err, result) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(result.img.Buffer);
//       console.log("Saved To database");
//       res.contentType(final_img.contentType);
//       res.send(final_img.image);
//     }
//   });
// });

app.post("/posts",async (req, res) => {


  const post = new Post({
    
    owner: req.body.owner,
    name: req.body.name,
    age: req.body.age,
    race: req.body.race,
    model: req.body.model,
    sex: req.body.sex,
    date: req.body.date,
  });
  console.log("New element is created.");
  await post.save();
  res.send(post);
});

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          console.log(result);
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          console.log(error);
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match....",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            id:user._id,
            token,
          });
          console.log("Login success.");
        })
        // catch error if password do not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// // authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.send({ message: "You are authorized to access me" });
});

// word endpoints

app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.send(posts);
});

app.get("/postapply", async (req, res) => {
  const posts = await Applied.find();
  res.send(posts);
});
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    res.send(post);
  } catch {
    res.status(404);
    res.send({ error: "Post doesn't exist!" });
  }
});

app.post("/postapply", async (req, res) => {
  const post = new Applied({
    AnimalId: req.body.AnimalId,
    WhatApplied: req.body.WhatApplied,
    VaccineOfNewApply: req.body.VaccineOfNewApply,
    ExaminationOfNewApply: req.body.ExaminationOfNewApply,
    NotesOfNewApply: req.body.NotesOfNewApply,
    DateOfNewApply: req.body.DateOfNewApply,
  });
  console.log("New feature is created.");
  await post.save();
  res.send(post);
});

app.patch("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    if (req.body.img) {
      post.img = req.body.img;
    }
    if (req.body.name) {
      post.name = req.body.name;
    }

    if (req.body.age) {
      post.age = req.body.age;
    }
    if (req.body.race) {
      post.race = req.body.race;
    }

    if (req.body.sex) {
      post.sex = req.body.sex;
    }
    if (req.body.model) {
      post.model = req.body.model;
    }
    if (req.body.owner) {
      post.owner = req.body.owner;
    }

    await post.save();
    res.send(post);
  } catch {
    res.status(404);
    res.send({ error: "Post doesn't exist!" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.status(204).send();
    console.log("Silinme gerceklesti.");
  } catch {
    res.status(404);
    res.send({ error: "Post doesn't exist!" });
    console.log("Silinme hataa.");
  }
});

module.exports = app;
