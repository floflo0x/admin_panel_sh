module.exports = (req, res, next) => {
  if (!req.session.email) {
    return res.redirect("/");
    // return next();
  } else return next();
};
