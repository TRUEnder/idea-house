const passport = require('passport')
const LocalPassport = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initializePassport(getUserByEmail, getUserById) {
    async function authentication(email, password, done) {
        try {
            const user = await getUserByEmail(email)
            if (user == null) {
                return done(null, false, { message: 'Email or password is wrong' })
            } else {
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: 'Email or password is wrong' })
                }
            }
        } catch (e) {
            return done(e)
        }
    }

    // Main
    passport.use(new LocalPassport({ usernameField: 'email' }, authentication))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser(async (id, done) => {
        const user = await getUserById(id)
        return done(null, user)
    })

    return passport
}


module.exports = initializePassport