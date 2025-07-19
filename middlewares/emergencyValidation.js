function validateContact(req, res, next) {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }
  next();
}

module.exports = { validateContact };
