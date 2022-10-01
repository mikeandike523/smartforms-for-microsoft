const ConfigLoader = require('./ConfigLoader.js')
const jwt = require('jsonwebtoken')

console.log("dirname: " + __dirname)

const MW_verifyToken = (req, res, next) => {

    const token = req.body.jwt;
    const secret = ConfigLoader(["jwt", "secret_key"], __dirname)

    if (!token) {
        res.status(403).json(Result.error("jwt_missing", "No jwt token was included with this request."))
        return
    }

    jwt.verify(token, secret, (err, decoded) => {

        if (err) {
            res.status(401).json(Result.error("jwt_invalid", "Invalid jwt token. Please sign-out and sign-in again."))
        } else {
            req.userId = decoded.id
            next()
        }

    })
}

module.exports = MW_verifyToken