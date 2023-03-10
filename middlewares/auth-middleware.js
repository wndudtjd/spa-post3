const jwt = require('jsonwebtoken');
const { Users } = require('../models');

module.exports = async (req, res, next) => {
  const { authorization } = req.cookies;
  // bearer와 token 분리
  const [authType, authToken] = (authorization ?? '').split(' ');

  if (authType !== 'Bearer' || !authToken) {
    return res.status(401).json({
      errorMessage: '로그인 후에 사용하세요.',
    });
  }

  try {
    const { userId } = jwt.verify(authToken, 'my-secret-key');

    const user = await Users.findOne({ _id: userId });

    res.locals.user = user;
    next();
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      errorMessage: '로그인 후에 사용하세요.',
    });
  }
};
