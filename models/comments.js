'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // 1. 한 유저는 여러 댓글을 작성할 수 있다.
      this.belongsTo(models.Users, { // 2. Users 모델에게 N:1 관계 설정을 합니다.
        targetKey: 'userId', // 3. Users 모델의 userId 컬럼을
        foreignKey: 'userId', // 4. Comments 모델의 UserId 컬럼과 연결합니다.
      });

      // 2. 한 게시물은 여러 댓글이 작성될 수 있다.
      this.belongsTo(models.Posts, {
        targetKey: 'postId',
        foreignKey: 'postId',
      });
    }
  }
  Comments.init(
    {
      commentId: {
        allowNull: false, // NOT NULL
        autoIncrement: true, // AUTO_INCREMENT
        primaryKey: true, // Primary Key (기본키)
        type: DataTypes.INTEGER,
      },
      postId: {
        allowNull: false, // NOT NULL
        type: DataTypes.INTEGER,
      },
      userId: {
        allowNull: false, // NOT NULL
        type: DataTypes.INTEGER,
      },
      comment: {
        allowNull: false, // NOT NULL
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false, // NOT NULL
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false, // NOT NULL
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Comments',
    },
  );
  return Comments;
};
