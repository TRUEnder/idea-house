function blockForAuthenticated(req, res, next) {
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) {
        return res.redirect(`/users/${req.user._id}`)
    } else {
        next()
    }
}

module.exports = blockForAuthenticated