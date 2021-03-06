var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    Model = require('./models/models.js')

module.exports = function(app) {
  //here we are adding the passport middleware to express
  app.use(passport.initialize()) //needed to support express
  app.use(passport.session())// for express
  //when we use 'local' we are referring to this local strategy
  passport.use(new LocalStrategy(
    function(username, password, done) {
     //checks if there is a user with that username
      Model.User.findOne({
        where: {
          'username': username
        }
      }).then(function (user) { //gets called upon when findOne is fullfilled
        if (user == null) {
          return done(null, false, { message: 'Incorrect credentials.' })
        }

        var hashedPassword = bcrypt.hashSync(password, user.salt)
        //hashing algo will always create same output when given the same input.
        //you cannot go backwords from a hashed string to uncover original 
        //string.
        //salt protects from 
        //rainbow tables (table containing common passwords and their hashes)
        //works because rainbow table does not know the salt
        //salt does not offer protection from
        //bruteforce or dictionary (focus on hashing common passwords) attacks

        //check if password matched password in DB
        if (user.password === hashedPassword) {
          return done(null, user)
        }
        //if not return invalid credentials
        return done(null, false, { message: 'Incorrect credentials.' })
      })
    }
  ))

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    Model.User.findOne({
      where: {
        'id': id
      }
    }).then(function (user) {
      if (user == null) {
        done(new Error('Wrong user id.'))
      }

      done(null, user)
    })
  })
}
