const { pool } = require('../config/db');

const createTables = async () => {
  try {
    // Create posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        media_urls TEXT[] DEFAULT '{}',
        media_type VARCHAR(50),
        visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'connections')),
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create post_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
      )
    `);

    // Create post_comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create comment_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id)
      )
    `);

    // Create post_views table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_views (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        viewer_user_id INTEGER NOT NULL,
        ip_address INET,
        user_agent TEXT,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create post_shares table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_shares (
        id SERIAL PRIMARY KEY,
        original_post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        shared_by_user_id INTEGER NOT NULL,
        share_content TEXT,
        shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id)');

    console.log('Post service database tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
};


module.exports= {createTables};