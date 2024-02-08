"use strict";

/** Shared config for application; can be required many places. */
require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "postgresql:///fridge_test"
      : process.env.DATABASE_URL || "postgresql:///fridge";
}
//interal db uri postgres://whats_in_my_fridge_db_user:OdrlZ6X2nFSfvLIHN4dPc8eMhs24FbiF@dpg-cn1mn0icn0vc73f9orrg-a/whats_in_my_fridge_db
//external db uri postgres://whats_in_my_fridge_db_user:OdrlZ6X2nFSfvLIHN4dPc8eMhs24FbiF@dpg-cn1mn0icn0vc73f9orrg-a.frankfurt-postgres.render.com/whats_in_my_fridge_db
// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2c021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
