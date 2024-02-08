"use strict";
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
/** Related functions for recipes. */

class Recipe {

  static async addNew(label, link, image_url) {
    const duplicateCheck = await db.query(
          `SELECT id, label
           FROM recipes
           WHERE label = $1`,
        [label],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate recipe: ${label}`);
    }

    const result = await db.query(
          `INSERT INTO recipes
           (label,
            link,
            image_url
          )
           VALUES ($1, $2,$3)
           RETURNING *`, [label,link,image_url]
       ,
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all recipes.
   *

   **/

  static async findAll() {
    const result = await db.query(
          `SELECT *
           FROM recipes
          `,
    );
   
    return result;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/
  static async get(label) {
    const recipeRes = await db.query(
          `SELECT *
           FROM recipes
           WHERE label = $1`,
        [label],
    );
    const recipe = recipeRes.rows[0];
    if (!recipe) throw new NotFoundError(`No recipe: ${label}`);
    return recipe;
  }
  /** Update recipe data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
 
   *
   *
   * Throws NotFoundError if not found.
   *
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        /*
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
        needs to be update
        */ 
    )
    const querySql = `UPDATE recipes 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const recipe = result.rows[0];

    if (!recipe) throw new NotFoundError(`No recipe found: ${recipe}`);

    return recipe;
  }

  /** Delete given recipe from database; returns deleted recipe */
  static async remove(id) {
    let result = await db.query(
          `DELETE
           FROM recipes
           WHERE id= $1
           RETURNING id`,
        [id],
    );
    const recipe = result.rows[0];

    if (!recipe) throw new NotFoundError(`No recipe found: ${recipe}`);
  }
  /**Add new recipe-ingrediant many to many relationship */
  static async addNewIngrediantRelation(recipe_id, ingrediant_id){
    let result = await db.query(   
        `INSERT INTO ingrediants_recipes(ingrediant_id, recipe_id)VALUES($1, $2)`,[ingrediant_id,recipe_id]
    )
    const newRelation = result.rows[0];
    return newRelation
  }
}
module.exports =  Recipe;

