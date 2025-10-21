import express from 'express';
import userController from '../Controllers/userController.js';
import authenticateToken from '../Controllers/tokenController.js';
const userRouter = express.Router({mergeParams:true});

userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.delete("/logout", userController.logout);

export default userRouter;