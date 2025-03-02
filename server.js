const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const Recipe = require('./models/Recipe');

const app = express();
const port = 3000;

app.use(express.json());

// Home
app.get('/', (req, res) => {
    res.send('Welcome to RECIPEDIA');
});

// Register
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.json({ message: 'User registered successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        res.json({ message: 'Login Successful', username: user.username });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Login error' });
    }
});

// Get user profile
app.get('/profile/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ username: user.username, email: user.email });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update user details
app.put('/update/:email', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const updateData = { username };
        if (hashedPassword) updateData.password = hashedPassword;
        
        const user = await User.findOneAndUpdate(
            { email: req.params.email },
            { $set: updateData },
            { new: true }
        );
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Delete user account
app.delete('/delete/:email', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error deleting account' });
    }
});

// Add recipe
app.post('/recipes', async (req, res) => {
    const { title, ingredients, instructions, userId } = req.body;
    try {
        const recipe = new Recipe({ title, ingredients, instructions, userId });
        await recipe.save();
        res.json({ message: 'Recipe added successfully', recipe });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error adding recipe' });
    }
});

// Get all recipes
app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error fetching recipes' });
    }
});

// Get recipe by ID
app.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.json(recipe);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error fetching recipe' });
    }
});

// Update recipe
app.put('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.json({ message: 'Recipe updated successfully', recipe });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error updating recipe' });
    }
});

// Delete recipe
app.delete('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error deleting recipe' });
    }
});

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('DB Connected Successfully'))
    .catch(err => console.log(err));

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is running on port ${port}`);
});