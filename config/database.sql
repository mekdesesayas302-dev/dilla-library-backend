CREATE DATABASE du_library;
USE du_library;

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(50),
    category VARCHAR(100),
    is_digital BOOLEAN DEFAULT FALSE,
    pdf_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO books (title, author, category, is_digital) 
VALUES ('Solar Energy Systems', 'Dr. Abebe K.', 'Engineering', TRUE);