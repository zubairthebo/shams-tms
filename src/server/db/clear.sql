-- Clear all data from tables
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE news_items;
TRUNCATE TABLE user_categories;
TRUNCATE TABLE users;
TRUNCATE TABLE categories;
TRUNCATE TABLE settings;
SET FOREIGN_KEY_CHECKS = 1;