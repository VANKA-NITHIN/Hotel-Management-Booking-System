-- liquibase formatted sql

-- changeset luxurystay:3
ALTER TABLE users ADD COLUMN language_preference VARCHAR(10) DEFAULT 'en';
