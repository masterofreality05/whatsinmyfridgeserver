"use strict";
/** Routes for users. */
const jsonschema = require("jsonschema");
const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const Ingrediant = require("../models/ingrediant");
const router = express.Router();
/** POST / { user }  => { user, token }
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 * Returns list of all users.
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName,  }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/:username", async function (req, res, next) {
  try {
    console.log("awaiting user.get model", req.params.username)
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/**POST add ingrediants to user profil by adding new ingrediant if passing duplicate check
 * otherwise returning existing 
 * 
 */
//commenting out our middleware for the moment  ensureCorrectUserOrAdmin,
router.post("/adduseringrediant", async function(req, res, next){
  try {
    const {ingrediants, userID} = req.body
    console.log("ingrediants are", ingrediants)

      const newIngrediant = await Ingrediant.addNew(ingrediants)
      const newUserIngrediant = await User.addIngrediant(newIngrediant.id, userID)
      return res.json(newUserIngrediant)
    }
   catch(err){
    return next(err);
  }
})

router.post("/adduserrecipe", async function(req, res, next){
  try {
    
    const {recipe, userID} = req.body
    console.log("!!!!!!!!!", userID) //undefined
      const newFavoriteRecipe = await User.addRecipe(recipe, userID)
      return res.json(newFavoriteRecipe)
    }
   catch(err){
    return next(err);
  }
})

router.post("/removerecipe", async function(req, res, next){
  try {
    
    const {recipe, userID} = req.body
    console.log("!!!!!!!!!", userID) //undefined
      const deleted = await User.removeRecipe(recipe, userID)
      return res.json(deleted)
    }
   catch(err){
    return next(err);
  }
})




router.post("/removeingrediant", async function(req, res, next){
  try {
    const {ingrediantID, userID} = req.body
    const removedIngrediant = await User.removeIngrediant(ingrediantID, userID)
    return res.json(removedIngrediant)
  } catch(err){
    return next(err);
  }
})

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
