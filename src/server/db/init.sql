CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    email VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(255) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    main_scene_name VARCHAR(255) DEFAULT 'MAIN_TICKER',
    opener_template_name VARCHAR(255) DEFAULT 'TICKER_START',
    template_name VARCHAR(255) DEFAULT 'TICKER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_categories (
    user_id INT,
    category_id INT,
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255),
    website VARCHAR(255),
    email VARCHAR(255),
    logo_path VARCHAR(255),
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    youtube_url VARCHAR(255),
    tiktok_url VARCHAR(255),
    snapchat_url VARCHAR(255),
    threads_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_items (
    id CHAR(36) PRIMARY KEY,
    text TEXT NOT NULL,
    category_id VARCHAR(255) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(identifier)
);