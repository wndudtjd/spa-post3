const express = require('express');

const postRouter = require('./posts.router');
const loginRouter = require('./login.router');
const signupRouter = require('./signup.router');
const commentRouter = require('./comment.router')

const router = express.Router();

router.use('/auth', [loginRouter, signupRouter]);
router.use('/', [postRouter, commentRouter]);

module.exports = router;
