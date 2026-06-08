-- 초기 마이그레이션: 필수 extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";
