const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_secret_key", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden - Invalid or expired token" });
    }

    // Authorization rules for DailyDose
    const authorizedRoles = {
      // Only Caregiver can Manage medications
      "POST /api/medications": ["Caregiver"],
      "PUT /api/medications/[0-9]+": ["Caregiver"],
      "DELETE /api/medications/[0-9]+": ["Caregiver"],

      // Elderly users can mark medications as taken
      "POST /api/medications/[0-9]+/taken": ["Elderly"],

      //Elderly users view and manage emergency contacts
      "POST /api/emergency-contacts": ["Elderly"],
      "GET /api/emergency-contacts": ["Elderly"],
      "DELETE /api/emergency-contacts/[0-9]+": ["Elderly"]
    };

    // Build a key like "POST /medications/123"
    const requestedEndpoint = `${req.method} ${req.path}`;
    const userRole = decoded.role;

    // Match path with parameter (e.g., /medications/123)
    const authorizedMatch = Object.entries(authorizedRoles).find(
      ([endpointPattern, roles]) => {
        const pattern = endpointPattern
          .replace(/\//g, "\\/") // escape slashes
          .replace(/\[0-9\]\+/g, "[0-9]+"); // match numeric IDs
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(requestedEndpoint) && roles.includes(userRole);
      }
    );

    if (!authorizedMatch) {
      return res.status(403).json({ message: "Forbidden - Access denied for your role" });
    }

    req.user = decoded; // Attach decoded info to request
    next();
  });
}

module.exports = verifyJWT;
