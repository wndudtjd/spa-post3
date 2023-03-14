const express = require('express');
const { Posts } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 게시글 작성 API
router.post('/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const user = res.locals.user;

  await Posts.create({
    nickname: user.nickname,
    userId: user.userId,
    title,
    content,
    createdAt: new Date(),
  });

  res.status(201).json({ message: '게시글이 작성에 성공하였습니다.' });
});98

// 게시글 조회 API
router.get('/posts', async (req, res) => {
  const dataAll = await Posts.findAll({
    order : [['createdAt', 'DESC']]
  }); 

  res.status(200).json({ data: dataAll }); // 넣기
});


// 좋아요 게시글 조회 API -> 상세 조회 밑에 있으면 :postId가 likes를 string으로 잡아먹음 무조건 상세조회 위로
router.get('/posts/likes', authMiddleware, async (req, res) => {
  // 로그인 계정 : id 받기
  const {userId} = res.locals.user                                

  // likes 순으로 찾기
  const dataAll = await Posts.findAll({                           
      order: [['likes', 'DESC']],
  })

  // 좋아요 표에서 userId만 찾은 정보
  const userPost = await Likes.findOne({                          
      where: {
          userId
      },
  })

  const data = []
  for (let i = 0; i < dataAll.length; i++) {
      // 좋아요에서 찾은 userId === 접속한 계정 userId && 좋아요에서 찾은 postId === 게시글 전체에서 찾은 postId 
      if(userPost.userId === userId && userPost.postId === dataAll[i].postId) {
          data.push({
              postId: dataAll[i].postId,
              userId: userId,
              nickname: dataAll[i].nickname,
              title: dataAll[i].title,
              createdAt: dataAll[i].createdAt,
              updatedAt: dataAll[i].updatedAt,
              likes: dataAll[i].likes
          });
      }
  }

  res.json({ data : data });
})


// 게시글 상세 조회 API
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  const currentPost = await Posts.findByPk(postId);
  console.log(currentPost);
  // 게시글이 없을때
  if (!currentPost) {
    return res
      .status(400)
      .json({ success: false, errorMessage: '게시글이 존재하지 않습니다.' });
  }

  res.status(200).json({ currentPost }); // 넣기
});

// 게시글 수정 API
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const user = res.locals.user;

  const currentPost = await Posts.findByPk(postId);

  try {
    // 데이터 형식이 올바르지 않음
    if (!currentPost) {
      res.status(412).json({
        success: true,
        errorMessage: '데이터 형식이 올바르지 않습니다.',
      });
      return;
    }

    // 제목 미입력
    if (!title) {
      res.status(412).json({
        success: true,
        errorMessage: '게시글 제목의 형식이 일치한지 않습니다.',
      });
      return;
    }

    // 내용 미입력
    if (!content) {
      res.status(412).json({
        errorMessage: '게시글 내용의 형식이 일치한지 않습니다.',
      });
      return;
    }

    // 로그인한 회원의 닉네임과 해당 게시글 작성한 닉네임이 다른 경우
    if (currentPost.nickname !== user.nickname) {
      res.status(403).json({
        errorMessage: '게시글 수정의 권한이 존재하지 않습니다.',
      });
      return;
    }

    // 수정할 게시글의 제목, 내용, 업데이트 날짜 수정
    await Posts.update(
      { title: title, content: content },
      { where: { postId, userId : user.userId } },
    );

    // 게시글 수정
    if (currentPost) {
      res.status(200).json({
        message: '게시글을 수정하였습니다.',
      });
      return;
    } else {
      res.status(401).json({
        errorMessage: '게시글이 정상적으로 수정되지 않았습니다.',
      });
      return;
    }
  } catch (err) {
    console.error(err);

    res.status(400).json({
      errorMessage: '게시글 수정에 실패했습니다.',
    });
  }
});

// 게시글 삭제 API
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const user = res.locals.user;

  const currentPost = await Posts.findByPk(postId);

  try {
    // 게시글이 존재하지 않는 경우
    if (!currentPost) {
      res.status(404).json({
        errorMessage: '게시글이 존재하지 않습니다.',
      });
      return;
    }
    // 로그인한 회원의 닉네임과 해당 게시글 작성한 닉네임이 다른 경우
    if (currentPost.nickname !== user.nickname) {
      res.status(403).json({
        errorMessage: '게시글 삭제의 권한이 존재하지 않습니다.',
      });
      return;
    }
    // 삭제할 게시글 조회
    await Posts.destroy({
      where: {postId},
    });
    // 게시글 삭제
    if (currentPost) {
      res.status(200).json({ message: '게시글을 삭제하였습니다.' });
      return;
    } else {
      res
        .status(401)
        .json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
      return;
    }
  } catch (err) {
    res.status(400).json({
      errorMessage: '게시글 삭제에 실패했습니다.',
    });
    return;
  }
});

router.put('/posts/:postId/likes', authMiddleware, async (req, res) => {
  // 경로에 넣은 postId 받기
  const { postId } = req.params
  
  // 로그인 계정 : userid 받기
  const { userId } = res.locals.user
  
  // json.body : like넣기
  const { likes } = req.body
  
  // 게시글표에서 postid, userid 같은거 찾기
  const findPost = await Posts.findAll({                          
  where: {
      postId, userId: userId
  }})

  // 좋아요표에서 uerid 같은거
  const userPost = await Likes.findOne({                          
      where: {
          userId
      }
  })

  // 게시글 있을때
  if(findPost) {                      
    
    // json.body값이 1이면
    if(likes === 1) {
      // 이때 이미 1을 눌렀으면
      if(userPost) {                                          
        res.status(400).json({'message': '이미 좋아요를 했습니다.'})
      } else {
        // 안눌렀으면 추가
        await Likes.create({postId, userId})
        await Posts.increment({likes: 1},{where : {postId}})
        res.json({ 'message' : '게시글의 좋아요를 등록하였습니다.'})
      }    
    } else {
      // json.body값이 1아니면 삭제
      await Likes.destroy({where:{postId, userId}})   
      await Posts.decrement({likes: 1},{where : {postId}})
      res.json({ 'message' : '게시글의 좋아요를 취소하였습니다.'})
    }
  }
})

module.exports = router;
