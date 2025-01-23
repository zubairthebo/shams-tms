-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, name, designation, email, role) 
VALUES (
    'admin',
    '$2a$10$rQnM9C6Ux8kXZA.fHJWZs.BzLG0RQxH3V4yN5HXK3pxxL8ZlHyTxe',
    'Administrator',
    'System Administrator',
    'admin@example.com',
    'admin'
) ON DUPLICATE KEY UPDATE id=id;

-- Insert some default categories
INSERT INTO categories (identifier, name_ar, name_en, main_scene_name, opener_template_name, template_name) VALUES
    ('news', 'أخبار', 'News', 'NEWS_SCENE', 'NEWS_OPENER', 'NEWS_TEMPLATE'),
    ('sports', 'رياضة', 'Sports', 'SPORTS_SCENE', 'SPORTS_OPENER', 'SPORTS_TEMPLATE'),
    ('weather', 'طقس', 'Weather', 'WEATHER_SCENE', 'WEATHER_OPENER', 'WEATHER_TEMPLATE')
ON DUPLICATE KEY UPDATE id=id;

-- Assign all categories to admin user
INSERT INTO user_categories (user_id, category_id)
SELECT 
    (SELECT id FROM users WHERE username = 'admin'),
    id
FROM categories
ON DUPLICATE KEY UPDATE user_id=user_id;