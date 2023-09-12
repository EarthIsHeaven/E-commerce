import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
dotenv.config();

const app = express();

const { Schema } = mongoose;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://0.0.0.0:27017/ecommerceUser');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.send("Home page");
    // res.render("home");
});

app.get("/login", function (req, res) {
    res.send("login page");
    // res.render("login");
});
app.get("/register", function (req, res) {
    res.send("register page");
    // res.render("register");
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.send("secret");
        // res.render("secrets");
    } else {
        res.send("login");
        // res.redirect("/login");
    }
});

app.get("/logout", function (req, res) {
    req.logOut(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
})

app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    })
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
})