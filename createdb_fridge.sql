\echo 'Delete and recreate whats in my fridge db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE fridge;
CREATE DATABASE fridge;
\connect fridge

\i fridge-schema.sql
\i fridge-seed.sql

\echo 'Delete and recreate fridge_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE fridge_test;
CREATE DATABASE fridge_test;
\connect fridge_test

\i fridge-schema.sql
