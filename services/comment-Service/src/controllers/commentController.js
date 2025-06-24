const Comment= require('../models/commentModel.js');
const {createCommentSchema}= require('../validations/schema.js');

exports.createComment= async(req,res)=>{
    try{
        const { error, value } = createCommentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const {postId, content}= value;
        const userId= req.user.id;
        
        const comment = await Comment.create({ postId, userId, content });
        res.status(201).json(comment);
        }
        catch(err){
            next(err);
        }
}

exports.getComments= async(req,res)=>{
    try{
        const {postId}= req.params;
        const comments= await Comment.findAll({
            where: {postId},
            order: [['createdAt', 'DESC']]
        });
        res.json(comments);
    }
    catch(err){
        next(err);
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
  
      const comment = await Comment.findByPk(commentId); // find on the Basis of the Primart Key
      if (!comment) return res.status(404).json({ error: 'Comment not found' });
      if (comment.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
  
      await comment.destroy();
      res.json({ message: 'Comment deleted' });
    } catch (err) {
      next(err);
    }
  };