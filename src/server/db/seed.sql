-- Insert admin user (password: admin123)
INSERT INTO users (username, password, name, designation, email, role) VALUES
('admin', '$2a$10$mLZKxmxXk4bRI9AZKtQYYuqhwE7OYq9BkYVOzPyxqhEHJNzqkZGYy', 'Admin User', 'Administrator', 'admin@example.com', 'admin');

-- Insert sample categories
INSERT INTO categories (identifier, name_ar, name_en, main_scene_name, opener_template_name, template_name) VALUES
('news', 'أخبار', 'News', 'MAIN_TICKER', 'TICKER_NEWS_START', 'TICKER_NEWS'),
('sports', 'رياضة', 'Sports', 'MAIN_TICKER', 'TICKER_SPORTS_START', 'TICKER_SPORTS');

-- Insert sample settings
INSERT INTO settings (company_name, website_url, email) VALUES
('ShamsTV', 'https://shams.tv', 'info@shams.tv');