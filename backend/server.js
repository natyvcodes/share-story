require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const multer = require('multer'); 
const port = 3000;
const db = require('./src/queries');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage }); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.get('/', (req, res) => {
    res.json({ message: 'Hola' });

})
app.post('/addStory', upload.single('image_url'), db.addStory);
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