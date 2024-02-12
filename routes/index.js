const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;





const User = require('../models/user');


router.get('/', (req, res) => {
    res.redirect('/login');
});


router.get('/login', (req, res) => {
    res.render('pages/login');
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });

        if (user) {

            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {


                res.redirect('/main');
            } else {

                res.send('Invalid username or password.');
            }
        } else {

            res.send('Invalid username or password.');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.send('An error occurred during login.');
    }
});

router.get('/signup', (req, res) => {
    res.render('pages/register');
});

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        res.send('An error occurred during sign up.');
    }
});


router.get('/main', (req, res) => {
    res.render('pages/main');
});



module.exports = router;
