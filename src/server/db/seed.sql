-- Create admin user with hashed password for 'admin123'
INSERT INTO users (username, password, name, designation, email, role) 
VALUES (
    'admin',
    '$2a$10$rQnM9C6Ux8kXZA.fHJWZs.BzLG0RQxH3V4yN5HXK3pxxL8ZlHyTxe',
    'Administrator',
    'System Administrator',
    'admin@example.com',
    'admin'
) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO categories (identifier, name_ar, name_en) VALUES
    ('news', 'أخبار', 'News'),
    ('sports', 'رياضة', 'Sports'),
    ('weather', 'طقس', 'Weather')
ON DUPLICATE KEY UPDATE identifier=identifier;

INSERT INTO settings (id, company_name, website_url, email) 
VALUES (
    1,
    'ShamsTV',
    'https://shams.tv',
    'info@shams.tv'
) ON DUPLICATE KEY UPDATE id=id;