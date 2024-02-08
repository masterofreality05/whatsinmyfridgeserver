"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    console.log("inside out user.authenticate model method")
    const result = await db.query(
          `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {

      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        console.log("authorized")
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, firstName, lastName, email, isAdmin, profile_img = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin,
            profile_img)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin", profile_img`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          isAdmin,
          profile_img
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin",
                  profile_img
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];
    const ingrediants = await db.query(`SELECT i.item_name, i.id FROM ingrediants i
    JOIN users_ingrediants ui ON i.id = ui.ingrediant_id WHERE ui.user_id = $1`,[user.id])

    console.log("heres our user ingrediants feedback ", ingrediants.rows[0])
    user.ingrediants = []
    ingrediants.rows.map(i => user.ingrediants.push([i.item_name, i.id]))

    if (!user) throw new NotFoundError(`No user: ${username}`);
   /** 
    const userApplicationsRes = await db.query(
          `SELECT a.job_id
           FROM applications AS a
           WHERE a.username = $1`, [username]);

    user.applications = userApplicationsRes.rows.map(a => a.job_id);
    */ //This is not relevant, but we can use this to find our recipes maybe!
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  /**Add an ingrediant to the users account by created a user_ingrediant relation  */
  static async addIngrediant(ingrediantID, userID){ //userID is now undefined
    const IngrediantUserRelation = await db.query(`
    INSERT INTO users_ingrediants 
    (user_id,
    ingrediant_id)
    VALUES
    ($1, $2)
    RETURNING user_id, ingrediant_id`,[userID, ingrediantID])

    return IngrediantUserRelation.rows[0]


  }

  static async addRecipe(recipeID, userID){ 


    const recipeUserRelation = await db.query(`
    INSERT INTO users_recipes 
    (user_id,
    recipe_id)
    VALUES
    ($1, $2)
    RETURNING user_id, recipe_id`,[userID, recipeID])

    return recipeUserRelation.rows[0]


  }

  static async removeIngrediant(ingrediantID, userID){ //userID is now undefined
    console.log("inside users.addINgrediant. Ingrediant ID:", ingrediantID, "userID:", userID)
    const IngrediantUserRelation = await db.query(`
    DELETE FROM users_ingrediants 
    WHERE ingrediant_id = $1 AND user_id = $2
    RETURNING user_id, ingrediant_id`,[ingrediantID, userID])

    return IngrediantUserRelation.rows[0]

  }

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Apply for job: update db, returns undefined.
   *
   * - username: username applying for job
   * - jobId: job id
   **/

  
}


module.exports = User;
