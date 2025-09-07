import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

// ✅ Check for required env variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    "⚠️ Missing Google OAuth credentials. Google login will be disabled."
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/google/callback`, // full backend URL
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
            console.log("🔑 Google Profile:", profile);
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account if not linked
            if (!user.googleId) {
              user.googleId = profile.id;
            }
            user.isLoggedIn = true;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos?.[0]?.value || "",
              isLoggedIn: true,
              isVerified: true,
            });
          }

          return cb(null, user);
        } catch (error) {
          return cb(error, null);
        }
      }
    )
  );

  console.log("✅ Google OAuth strategy initialized");
}

export default passport;
