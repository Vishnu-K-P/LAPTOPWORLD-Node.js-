

module.exports = {
    verifyLogin: (req, res, next) => {
        if (req.session.loggedIn) {
            next();
        }
        else {
            res.redirect('/login-register')
        }
    },

    verifynotLogin: (req, res, next) => {
        if (req.session.loggedIn==false) {
            next();
        }
    }


}
