const express = require('express')
const router = express.Router()
const {Comments} = require('../models')
const authMiddleware = require('../middlewares/auth-middleware')

// 댓글 작성 API
router.post('/posts/:postId/comments', authMiddleware, async(req, res) => {
  const {postId} = req.params;
  const {comment} = req.body;
  const user = res.locals.user;

  try {
    // 게시글 미존재
    if (!postId) {
      res.status(404).json({
        errorMessage: '게시글이 존재하지 않습니다.',
      })
      return
    }

    // 댓글 미입력
    if (!comment) {
      res.status(404).json({
        errorMessage: '댓글의 데이터 형식이 올바르지 않습니다.',
      })
      return
    }

    // 댓글 생성
    await Comments.create({
      postId: postId,
      userId: user.userId,
      comment: comment,
      nickname: user.nickname,
      createdAt: new Date(),
    })
    res.status(201).json({ message: '댓글 작성에 성공하였습니다.' })
  }catch(err) {
    console.error(err)

    res.status(400).json({
      errorMessage: '댓글 작성에 실패하였습니다.',
    })
    return
  }
})

// 댓글 목록 조회 API
router.get('/posts/:postId/comments', async (req, res) => {
  const comments = await Comments.findAll({
    where: {postId}
  })

  res.status(200).json({ data: comments })
})

// 댓글 수정 API
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params
  const { comment } = req.body
  const user = res.locals.user

  const currentComments = await Comments.findByPk(commentId)

  try {
    // 게시글이 없을 때
    if (!postId) {
      res.status(404).json({
        errorMessage: '게시글이 존재하지 않습니다.',
      })
      return
    }
    // 닉네임이 서로 다를때
    if (currentComments.nickname !== user.nickname) {
      res.status(403).json({
        errorMessage: '댓글 수정의 권한이 존재하지 않습니다.',
      })
      return
    }
    // 댓글 미입력
    if (!comment) {
      res.status(412).json({
        errorMessage: '댓글 형식이 올바르지 않습니다.',
      })
      return
    }
    await Comments.update(
      {comment: comment},
      {where : {commentId}}
      )

    if (currentComments) {
      res.status(200).json({
        message: '댓글을 수정하였습니다.',
      })
      return
    } else {
      res.status(400).json({
        errorMessage: '댓글 수정이 정상적으로 처리되지 않았습니다.',
      })
      return
    }
  } catch (err) {
    console.error(err)

    res.status(400).json({
      errorMessage: '댓글 수정에 실패하였습니다.',
    })
  }
})

// 댓글 삭제 API
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  const { postId, commentId } = req.params
  const user = res.locals.user
  // console.log(user);
  const currentComments = await Comments.findByPk(commentId)

  try {
    // 게시글이 없을 때
    if (!postId) {
      res.status(404).json({
        errorMessage: '게시글이 존재하지 않습니다.',
      })
      return
    }
    // 댓글이 없을 때
    if (!currentComments) {
      res.status(404).json({
        errorMessage: '댓글이 존재하지 않습니다.',
      })
      return
    }
    // 닉네임이 서로 다를때
    if (currentComments.nickname !== user.nickname) {
      res.status(403).json({
        errorMessage: '댓글의 삭제의 권한이 존재하지 않습니다.',
      })
      return
    }
    // 삭제할 게시글 조회
    await Comments.destroy({
      where: {commentId}
    })
    // 게시글 삭제
    if (currentComments) {
      res.status(200).json({ message: '댓글을 삭제하였습니다.' })
      return
    } else {
      res.status(401).json({ errorMessage: '댓글 삭제가 정상적으로 삭제되지 않았습니다.' })
      return
    }
  } catch (err) {
    res.status(400).json({
      errorMessage: '댓글 삭제에 실패했습니다.',
    })
    return
  }
})
module.exports = router;