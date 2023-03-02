import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { connection } from "../db/dbconnect.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, name, roleName } = req.body;

  if (!email || !password || !name || !roleName) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const userExists = await connection("users")
    .select()
    .where("email", email)
    .first();

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const roleExists = await connection("roles")
    .select()
    .where("name", roleName)
    .first();

  if (!roleExists) {
    res.status(400);
    throw new Error("Invalid Role name");
  }

  if (roleName == "admin" || roleName == "manager") {
    res.status(400);
    throw new Error("Unauthorized Role name");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await connection("users").insert({
    email: email,
    password: hashedPassword,
    name: name,
  });

  const [user] = await connection("users").select().where("email", email);

  await connection("users_roles").insert({
    user_id: user.id,
    role_id: roleExists.id,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      email: user.email,
      name: user.name,
      role: roleExists.name,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [user] = await connection("users").select().where("email", email);

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      email: user.email,
      name: user.name,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

export const createRole = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (req.user.userRole != "admin" || req.user.userRole != "manager") {
    res.status(400);
    throw new Error("Unauthorized user");
  }

  const roleExists = await connection("roles")
    .select()
    .where("name", name)
    .first();

  if (roleExists) {
    res.status(400);
    throw new Error("Role already exists");
  }

  await connection("roles").insert({
    name: name,
  });

  let [role] = await connection("roles").select().where("name", name);

  if (role) {
    res.status(201).json({
      _id: role.id,
      name: role.name,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const usersRoles = asyncHandler(async (req, res) => {
  const { email, roleName } = req.body;

  if (!email || !roleName) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (req.user.userRole != "admin" && req.user.userRole != "manager") {
    res.status(400);
    throw new Error("Unauthorized user");
  }

  const roleExists = await connection("roles")
    .select()
    .where("name", roleName)
    .first();

  if (!roleExists) {
    res.status(400);
    throw new Error("Invalid Role name");
  }

  const userExists = await connection("users")
    .select()
    .where("email", email)
    .first();

  if (!userExists) {
    res.status(400);
    throw new Error("Invalid User email");
  }

  await connection("users_roles").insert({
    user_id: userExists.id,
    role_id: roleExists.id,
  });

  const [userRole] = await connection("users_roles")
    .select()
    .where("user_id", userExists.id);

  if (userRole) {
    res.status(201).json({
      user_id: userRole.user_id,
      role_id: userRole.role_id,
    });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

const generateToken = (id) => {
  return jwt.sign({ sub: id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
