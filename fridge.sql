\echo 'Delete and recreate whats in my fridge db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE fridge;
CREATE DATABASE fridge;
\connect fridge 

CREATE TABLE ingrediants (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  link TEXT NOT NULL,
  image_url TEXT NOT NULL
);

CREATE TABLE ingrediants_recipes(
  id SERIAL PRIMARY KEY,
  ingrediant_id INT REFERENCES ingrediants(id),
  recipe_id INT REFERENCES recipes(id)

);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
    CHECK (position('@' IN email) > 1),
  profile_img TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users_recipes(
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  recipe_id INT REFERENCES recipes(id) 
);

CREATE TABLE users_ingrediants(
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  ingrediant_id INT REFERENCES ingrediants(id)
);

CREATE TABLE comments(
  id SERIAL PRIMARY KEY,
  user INT REFERENCES users(id),
  content TEXT

)

CREATE TABLE likes_comments(

  id SERIAL PRIMARY KEY,
  liked_by INT REFERENCES users(id) ON DELETE CASCADE,
  comment INT REFERENCES comments(id) ON DELETE CASCADE
)







