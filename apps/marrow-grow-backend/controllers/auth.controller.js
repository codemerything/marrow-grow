import Player from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper function to generate Access Token
const generateAccessToken = (userId, isAdmin) => {
  return jwt.sign({ id: userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
};

// Helper function to generate Refresh Token
const generateRefreshToken = (userId, isAdmin) => {
  return jwt.sign({ id: userId, isAdmin }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
};

const sendRefreshTokenAsCookie = (res, refreshToken) => {
  const refreshTokenMaxAge =
    parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || "7", 10) *
    24 *
    60 *
    60 *
    1000;
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
    sameSite: "strict", // Mitigates CSRF
    maxAge: refreshTokenMaxAge,
  });
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  // Add an explicit check for empty or null username
  if (typeof username !== "string" || username.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please provide a valid username." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." });
  }

  try {
    let player = await Player.findOne({ $or: [{ email }, { username }] });
    if (player) {
      return res
        .status(400)
        .json({ message: "User already exists with this email or username." });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    player = new Player({
      username,
      email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(player._id, player.isAdmin);
    const refreshToken = generateRefreshToken(player._id, player.isAdmin);

    player.refreshToken = refreshToken; // Store the refresh token (consider hashing it in a real app for extra security)
    await player.save();

    sendRefreshTokenAsCookie(res, refreshToken);

    const { password: _, refreshToken: __, ...playerInfo } = player._doc;
    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      player: playerInfo,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
};

export const signin = async (req, res) => {
  const { email, password: plainPassword } = req.body;

  if (!email || !plainPassword) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  try {
    const player = await Player.findOne({ email });
    if (!player) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. User not found." });
    }

    const isMatch = await bcryptjs.compare(plainPassword, player.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Incorrect password." });
    }

    const accessToken = generateAccessToken(player._id, player.isAdmin);
    const newRefreshToken = generateRefreshToken(player._id, player.isAdmin);

    player.refreshToken = newRefreshToken;
    await player.save();

    sendRefreshTokenAsCookie(res, newRefreshToken);

    const { password: _, refreshToken: __, ...playerInfo } = player._doc;
    res.status(200).json({
      message: "User signed in successfully",
      accessToken,
      player: playerInfo,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Server error during signin." });
  }
};

export const adminSignin = async (req, res) => {
  const { email, password: plainPassword } = req.body;

  if (!email || !plainPassword) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  try {
    const player = await Player.findOne({ email });
    if (!player) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. User not found." });
    }

    const isMatch = await bcryptjs.compare(plainPassword, player.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Incorrect password." });
    }

    // !!! ADD THIS CHECK !!!
    // Verify if the user is an admin.
    // This assumes your Player model has an 'isAdmin' boolean field.
    if (!player.isAdmin) {
      return res
        .status(403) // Forbidden
        .json({
          message: "Access Denied. Admin privileges required to log in.",
        });
    }
    // !!! END OF ADDED CHECK !!!

    const accessToken = generateAccessToken(player._id, player.isAdmin);
    const newRefreshToken = generateRefreshToken(player._id, player.isAdmin);

    player.refreshToken = newRefreshToken;
    await player.save();

    sendRefreshTokenAsCookie(res, newRefreshToken);

    const { password: _, refreshToken: __, ...playerInfo } = player._doc;
    res.status(200).json({
      message: "Admin user signed in successfully", // Updated message for clarity
      accessToken,
      player: playerInfo,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Server error during signin." });
  }
};

export const refreshTokenHandler = async (req, res) => {
  const tokenFromCookie = req.cookies.refreshToken;
  if (!tokenFromCookie) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(
      tokenFromCookie,
      process.env.REFRESH_TOKEN_SECRET
    );
    const player = await Player.findById(decoded.id);

    if (!player || player.refreshToken !== tokenFromCookie) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const newAccessToken = generateAccessToken(player._id, player.isAdmin);
    const { password: _, refreshToken: __, ...playerInfo } = player._doc;
    res.json({ accessToken: newAccessToken, player: playerInfo });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res
      .status(403)
      .json({ message: "Refresh token verification failed." });
  }
};
export const signoutHandler = async (req, res) => {
  const tokenFromCookie = req.cookies.refreshToken;

  if (tokenFromCookie) {
    try {
      // Find user by refresh token and clear it
      // This step is important to invalidate the token on the server side
      const player = await Player.findOne({ refreshToken: tokenFromCookie });
      if (player) {
        player.refreshToken = null; // Or undefined, or an empty string
        await player.save();
      }
    } catch (error) {
      // Log error but proceed to clear cookie as a best effort
      console.error(
        "Error invalidating refresh token in DB during signout:",
        error
      );
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "User signed out successfully." });
};
