const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(
  session
);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./src/controllers/error");
const User = require("./src/models/user");

const MONGODB_URI =
  "mongodb+srv://lenhanhao:ngocdung209@cluster0.25jqjeu.mongodb.net/BDS?retryWrites=true&w=majority";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );
  next();
});
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/quicktime" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "src/views");

const userRoutes = require("./src/routes/user");
const shopRoutes = require("./src/routes/shop");
const managerRoutes = require("./src/routes/manager");
const authRoutes = require("./src/routes/auth");

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).fields([
    { name: "image", maxCount: 50 },
    { name: "video", maxCount: 10 },
  ])
);
app.use(express.static(path.join(__dirname, "src/public")));
app.use(
  "/images",
  express.static(path.join(__dirname, "./images"))

);

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.role = req.session.user
    ? req.session.user.role
    : "user";
  res.locals.name = req.session.user
    ? req.session.user.name
    : "";
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/user", userRoutes);
app.use(shopRoutes);
app.use("/manager", managerRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

const PORT = process.env.PORT || 3000;
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Server is ready!!");

    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });
