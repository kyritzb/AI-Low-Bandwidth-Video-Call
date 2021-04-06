/**
 * Verifies the authentication token of the user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

function verifyToken(req: any, res: any, next: Function) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).send("Invalid authorization token");
  }
}

export { verifyToken };
