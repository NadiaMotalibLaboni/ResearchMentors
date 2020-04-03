const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


//User model
const User = require('../models/User.js');

//Login Page
router.get('/login', (req, res) => res.render('login'));

//Registration Page
router.get('/register', (req, res) => res.render('register'));

//Forgot Password page
router.get('/forgotpassword', (req, res) => res.render('forgotpassword'));


//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if(!name || !email || !password || !password2)
    errors.push({msg: 'Please fill in the all fields' });

    //Check password match
    if(password != password2){
        errors.push({msg: 'Passwords do not match' });
    }

    //check Password length
    if(password.length < 6){
        errors.push({msg: 'Password should be atleast 6 characters' });
    }

    if(errors.length>0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
       //Validation passed
        User.findOne({ email: email})
            .then(user => {
                if(user) {
                    errors.push({ msg: 'Email is already registered.' });
                    //User exists
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err,hash) => {
                        if(err) throw err;

                        //Set password to hashed
                        newUser.password = hash;
                        //Save user
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                    }))
                }

            });
    }
});

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//logout Handle
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are logged out'); 
    res.redirect('/users/login');            
});

module.exports = router;