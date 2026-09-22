// =========================================================
//  utils/serializeUser.js
//  The ONE place that turns a Mongoose user document into the
//  safe object we send to the client.
//
//  Every response that carries user data (register, login,
//  getProfile, updateProfile, listUsers) used to build this shape
//  by hand — a classic copy-paste drift risk. Now they all call
//  this function, so the public user shape is defined in exactly
//  one place.
//
//  SECURITY: password and refreshTokenHash are select:false in
//  the model and are never referenced here. This only ever emits
//  the public fields.
// =========================================================

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = { serializeUser };