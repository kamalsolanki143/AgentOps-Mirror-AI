-- AgentOps Mirror AI Database Schema

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE personas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    traits JSONB DEFAULT '[]',
    background TEXT,
    communication_style VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scenarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    category VARCHAR(100)
);

CREATE TABLE stress_tests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'queued',
    config JSONB,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE transcripts (
    id SERIAL PRIMARY KEY,
    stress_test_id INTEGER REFERENCES stress_tests(id),
    persona_id INTEGER REFERENCES personas(id),
    conversation JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_results (
    id SERIAL PRIMARY KEY,
    transcript_id INTEGER REFERENCES transcripts(id),
    security_score FLOAT,
    quality_score FLOAT,
    latency_score FLOAT,
    policy_score FLOAT,
    business_score FLOAT,
    overall_score FLOAT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    stress_test_id INTEGER REFERENCES stress_tests(id),
    title VARCHAR(255),
    summary TEXT,
    data JSONB,
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    config JSONB,
    enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
