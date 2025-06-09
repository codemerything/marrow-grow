import express from "express";
import {
  signup,
  signin,
  refreshTokenHandler,
  signoutHandler,
  adminSignin,
} from "../controllers/auth.controller.js";

const router = express.Router();

// @route   POST api/auth/signup
// @desc    Register a new player
// @access  Public
router.post("/signup", signup);

// @route   POST api/auth/signin
// @desc    Authenticate player & get access token, refresh token in cookie
// @access  Public
router.post("/signin", signin);
router.post("/adminsignin", adminSignin);

// @route   GET api/auth/refresh-token
// @desc    Get a new access token using refresh token
// @access  Public (requires http-only cookie with refresh token)
router.post("/refresh-token", refreshTokenHandler);

// @route   POST api/auth/signout
// @desc    Sign out player and invalidate refresh token
// @access  Public (requires http-only cookie with refresh token)
router.post("/signout", signoutHandler);

export default router;
