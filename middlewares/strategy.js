import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import { connection } from "../db/dbconnect.js";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export const pass = passport.use(
  new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      const user = await connection("users")
        .select("id", "email")
        .where("id", jwtPayload.sub)
        .first();
      if (!user) {
        res.status(400);
        throw new Error("User Not Found");
      }

      const roleId = await connection("users_roles")
        .select("role_id")
        .where("user_id", user.id)
        .first();
      if (!roleId) {
        res.status(400);
        throw new Error("Role Not assigned");
      }

      const role = await connection("roles")
        .select("name")
        .where("id", roleId?.role_id)
        .first();
      if (!role) {
        res.status(400);
        throw new Error("Role Not Found");
      }

      if (user) {
        user.userRole = role.name;
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);
