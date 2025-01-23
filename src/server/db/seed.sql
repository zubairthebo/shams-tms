-- Insert sample data
INSERT INTO users (username, password, name, designation, email, role) VALUES
('admin', '$2a$10$your_hashed_password', 'Admin User', 'Administrator', 'admin@example.com', 'admin'),
('user1', '$2a$10$your_hashed_password', 'Regular User', 'Editor', 'user1@example.com', 'user');

INSERT INTO categories (identifier, name_ar, name_en, main_scene_name, opener_template_name, template_name) VALUES
('news', 'أخبار', 'News', 'MAIN_TICKER', 'TICKER_NEWS_START', 'TICKER_NEWS'),
('sports', 'رياضة', 'Sports', 'MAIN_TICKER', 'TICKER_SPORTS_START', 'TICKER_SPORTS');

INSERT INTO user_categories (user_id, category_id) VALUES
(2, 1),
(2, 2);

INSERT INTO settings (company_name, website_url, email) VALUES
('ShamsTV', 'https://shams.tv', 'info@shams.tv');

INSERT INTO news_items (id, text, category_id, created_by) VALUES
(UUID(), 'Sample news item 1', 1, 1),
(UUID(), 'Sample sports news', 2, 2);