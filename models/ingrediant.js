"use strict";
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Ingrediant {

  static async addNew(itemName) {
    const duplicateCheck = await db.query(
          `SELECT id, item_name
           FROM ingrediants
           WHERE item_name = $1`,
        [itemName],
    );
    if (duplicateCheck.rows[0]) {
      return duplicateCheck.rows[0]
  
    } else {
      const result = await db.query(
        `INSERT INTO ingrediants
         (item_name)
         VALUES ($1)
         RETURNING *`, [itemName]
     , 
  );

  return result.rows[0];
    }

  }

  /** Find all recipes.
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT *
           FROM ingrediants
           ORDER BY item_name`,
    );

    return result.rows;
  }

  /** Given a item_name, return data about an ingrediant.
   * Throws NotFoundError if user not found.
   **/

  static async get(itemName) {
    let lowerCase = itemName.lowerCase()
    const ingrediantRes = await db.query(
          `SELECT *
           FROM ingrediants
           WHERE item_name = $1`,
        [lowerCase],
    );

    const ingrediant = userRes.rows[0];

    if (!ingrediant) throw new NotFoundError(`No Ingrediant Found: ${ingrediant}`);
   /** 
    const userApplicationsRes = await db.query(
          `SELECT a.job_id
           FROM applications AS a
           WHERE a.username = $1`, [username]);

    user.applications = userApplicationsRes.rows.map(a => a.job_id);
    */ //This is not relevant, but we can use this to find our recipes maybe!
    return ingrediant;
  }

  /** Update ingrediant data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.

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
    const ingrediant = result.rows[0];

    if (!ingrediant) throw new NotFoundError(`No ingrediant found: ${ingrediant}`);

    return ingrediant;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(itemName) {
    let result = await db.query(
          `DELETE
           FROM ingrediants
           WHERE item_name= $1
           RETURNING item_name`,
        [itemName],
    );
    const ingrediant = result.rows[0];

    if (!ingrediant) throw new NotFoundError(`No recipe found: ${recipe}`);
  }


  
}

module.exports =  Ingrediant;
