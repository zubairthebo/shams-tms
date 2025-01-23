-- Insert initial categories
INSERT INTO categories (identifier, name_ar, name_en, main_scene_name, opener_template_name, template_name) VALUES
('politics', 'سياسة', 'Politics', 'MAIN_TICKER', 'TICKER_POLITICS_START', 'TICKER_POLITICS'),
('sports', 'رياضة', 'Sports', 'MAIN_TICKER', 'TICKER_SPORTS_START', 'TICKER_SPORTS'),
('economy', 'اقتصاد', 'Economy', 'MAIN_TICKER', 'TICKER_ECONOMY_START', 'TICKER_ECONOMY'),
('technology', 'تكنولوجيا', 'Technology', 'MAIN_TICKER', 'TICKER_TECH_START', 'TICKER_TECH');

-- Insert default admin user
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$your_hashed_password', 'admin');

-- Insert default settings
INSERT INTO settings (company_name, website_url, email) VALUES
('ShamsTV', 'https://shams.tv', 'info@shams.tv');