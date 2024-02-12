const express = require('express');
const router = express.Router();


const User = require('../models/user');


router.get('/admin', (req, res) => {

    res.render('pages/admin');
});



router.get('/add-user', (req, res) => {
    res.render('pages/add-user');
});


router.post('/add-user', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error adding new user:', error);
        res.redirect('/add-user');
    }
});


router.get('/edit-user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('pages/edit-user', { user });
    } catch (error) {
        console.error('Error fetching user for edit:', error);
        res.redirect('/admin');
    }
});


router.post('/edit-user/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error updating user:', error);
        res.redirect(`/edit-user/${req.params.id}`);
    }
});


router.get('/delete-user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.redirect('/admin');
    }
});

module.exports = router;
