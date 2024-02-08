"use strict";
/** Routes for recipes. */
const express = require("express");
const { BadRequestError } = require("../expressError");
const Ingrediant = require("../models/ingrediant")
const db = require("../db");
const router = express.Router();

/**This route will be used to get all the recipes saved to the favourites of a user */
router.get("/", async function (req, res, next) {
  try {
      let foundIngredient = await Ingrediant.findAll()  
      return res.json(foundIngredient)
  } catch (err) {
    return next(err);
  }
});

/**This route will be used to get the recipes saved to the favourites of a user */
router.get("/:ingredient", async function (req, res, next) {
    try {
        //commented out for the moment ensureCorrectUserOrAdmin
        let foundIngredient = Ingrediant.get()
    } catch (err) {
      return next(err);
    }
  });
  /**Add a new recipe, alongside ingrediants and recipe-ingrediant relations to the database */
  router.post("/add", async function (req, res, next) {
    try {
        const {ingrediants} = req.body
        let Individual_ingrediants = ingrediants.split(" ")
        for(let ingrediant of Individual_ingrediants){
            let newIngrediant = await Ingrediant.addNew(ingrediant)
            console.log(newIngrediant.data)
        }     
    } catch (err) {
      return next(err);
    } }
  );

  router.post("/addingrediant", async function(req, res, next){
    try {
      const {addName} = req.body
        const newIngrediant = await Ingrediant.addNew(addName)
        return res.json(newIngrediant)
      }
     catch(err){
      return next(err);
    }
  })

module.exports = router;