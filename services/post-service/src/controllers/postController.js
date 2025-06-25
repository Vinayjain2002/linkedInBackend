const pool= require('../config/db.js');
const redisClient= require('../config/redis.js');
const {getChannel} = require('../config/rabbitmq.js');
const {postSchema, commentSchema} = require('../validations/schema.js');

const createPost= async(req, res)=>{
    try{
        const {error, value}= postSchema.validate(req.body);
        if(error){
            return res.status(41).json({error: error.details[0].message});
        }
        const { content, media_urls, media_type, visibility } = value;
        const result= await pool.query(
            `INSERT INTO posts (user_id, content, media_urls, media_type, visibility)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, content, media_urls || [], media_type, visibility]
        );
        const post= result.rows[0];
      
        const channel= await getChannel();
        if(channel){
            channel.sendToQueue('post_created', Buffer.from(JSON.stringify({
                post_id: post.id,
                user_id: post.user_id,
                content: post.content,
                visibility: post.visibility
            })));
        }
        // Deleting the Global Feed Cache as new post is created
        const keys = await redisClient.keys('feed:global:*');
        if(keys.length > 0) {
            await redisClient.del(...keys);
        }
        
        return res.status(201).json({ 
            message: 'Post created successfully', 
            post 
        });
    }catch(err){
        console.error('Error creating post:', err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

const getPosts= async(req,res)=>{
    try{
        const {page=1, limit=10, user_id}= req.query;
        const offset= (page-1)*limit;
        let query, params;
        if(user_id){
            query = `
        SELECT p.*, 
               EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked
        FROM posts p 
        WHERE p.user_id = $2 AND p.is_active = true
        ORDER BY p.created_at DESC 
        LIMIT $3 OFFSET $4`;
        params= [req.user.id, user_id, limit, offset];
        }
        else{
            const cacheKey = `feed:global:${page}:${limit}`;
            const cachedFeed = await redisClient.get(cacheKey);
            if (cachedFeed) return res.json(JSON.parse(cachedFeed));
            query = `
            SELECT p.*, 
                   EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked
            FROM posts p 
            WHERE p.is_active = true AND p.visibility = 'public'
            ORDER BY p.created_at DESC 
            LIMIT $2 OFFSET $3`;
          params = [req.user.id, limit, offset];     
        }
        const result= await pool.query(query, params);
        const posts= result.rows;

        if(!user_id){
           await redisClient.setEx(`feed:global:${page}:${limit}`, 300, JSON.stringify(posts));
        }
        return res.json(posts);
    }
    catch(err){
        console.error('Error fetching posts:', err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

const getPostById= async(req,res)=>{
    try{
        const postId= req.params.id;
        const result = await pool.query(
            `SELECT p.*, 
                     EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as is_liked
              FROM posts p 
              WHERE p.id = $2 AND p.is_active = true`,
            [req.user.id, postId]
          );
        if(result.rows.length === 0){
            return res.status(404).json({error: 'Post not found'});
        }
        const post = result.rows[0];
        await pool.query(
          'INSERT INTO post_views (post_id, viewer_user_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
          [postId, req.user.id, req.ip, req.get('User-Agent')]
        );
    
        res.json(post);
    }
    catch(err){
        console.error('Error fetching post:', err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

const toggleLikePost= async(req,res)=>{
    try{
        const postId= req.params.id;
        const existingLike = await pool.query(
            'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
            [postId, req.user.id]
          );
          if(existingLike.rows.length > 0){
            await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, req.user.id]);
            await pool.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1', [postId]);
            res.status(200).json({message: 'Post unliked successfully', liked: false});
        }
        else{
            await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, req.user.id]);
            await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
            const channel = getChannel();
            if (channel) {
              channel.sendToQueue('post_liked', Buffer.from(JSON.stringify({
                post_id: postId,
                liked_by_user_id: req.user.id
              })));
            }
      
            res.json({ message: 'Post liked', liked: true });      
        }
        await redisClient.del(`post:${postId}`);
    }
    catch(err){
        console.error('Error liking post:', err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
}

const commentOnPost = async (req, res) => {
    try {
      const postId = req.params.id;
      const { error, value } = commentSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });
  
      const { content, parent_comment_id } = value;
      const result = await pool.query(
        `INSERT INTO post_comments (post_id, user_id, parent_comment_id, content)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [postId, req.user.id, parent_comment_id, content]
      );
  
      const comment = result.rows[0];
      await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);
  
      const channel = getChannel();
      if (channel) {
        channel.sendToQueue('post_commented', Buffer.from(JSON.stringify({
          post_id: postId,
          comment_id: comment.id,
          commented_by_user_id: req.user.id,
          content: comment.content
        })));
      }
  
      res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const getPostComments = async (req, res) => {
    try {
      const postId = req.params.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
  
      const result = await pool.query(
        `SELECT c.*, 
                 EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = $1) as is_liked
          FROM post_comments c 
          WHERE c.post_id = $2 AND c.is_active = true
          ORDER BY c.created_at ASC 
          LIMIT $3 OFFSET $4`,
        [req.user.id, postId, limit, offset]
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const sharePost = async (req, res) => {
    try {
      const postId = req.params.id;
      const { share_content } = req.body;
  
      const result = await pool.query(
        `INSERT INTO posts (user_id, content, visibility)
         VALUES ($1, $2, 'public') RETURNING *`,
        [req.user.id, share_content || 'Shared post']
      );
  
      const sharedPost = result.rows[0];
      await pool.query(
        'INSERT INTO post_shares (original_post_id, shared_by_user_id, share_content) VALUES ($1, $2, $3)',
        [postId, req.user.id, share_content]
      );
      await pool.query('UPDATE posts SET shares_count = shares_count + 1 WHERE id = $1', [postId]);
  
      const channel = getChannel();
      if (channel) {
        channel.sendToQueue('post_shared', Buffer.from(JSON.stringify({
          original_post_id: postId,
          shared_post_id: sharedPost.id,
          shared_by_user_id: req.user.id
        })));
      }
  
      res.status(201).json({ message: 'Post shared successfully', shared_post: sharedPost });
    } catch (error) {
      console.error('Share post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  module.exports = {
    createPost,
    getPosts,
    getPostById,
    toggleLikePost,
    commentOnPost,
    getPostComments,
    sharePost
  };
  