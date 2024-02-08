"use strict";
/** Express app for jobly. */
const express = require("express");
const cors = require("cors");
const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const recipeRoutes = require("./routes/recipes")
const ingrediantRoutes = require("./routes/ingrediants")
const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/recipes", recipeRoutes);
app.use("/ingrediants", ingrediantRoutes)

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  console.log("The page was not found")
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
