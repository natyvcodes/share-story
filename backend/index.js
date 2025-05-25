require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const multer = require('multer'); 
const port = 3000;
const db = require('./src/queries');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
    origin: 'https://sharestory.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.get('/', (req, res) => {
    res.json({ message: 'Hola' });

})
app.post('/addStory', db.addStory);
app.get('/getStories', db.getStories)
app.post('/Login', db.login)
app.post('/getStoryById', db.getStoryById)
app.post('/updateStory', db.updateStory)
app.post('/userRegister', db.userRegister)
app.post('/updateStoryState', db.updateStoryState)
app.post('/getUserById',db.getUserById)
app.post('/deleteStory', db.deleteStory)
app.post('/deleteAccount', db.deleteUser)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})