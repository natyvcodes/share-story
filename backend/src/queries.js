const { response, request } = require('express');
const pgp = require('pg-promise')();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = {
    host: 'pg-367562eb-dannypanda5524-dd69.l.aivencloud.com',
    port: 27920,
    database: 'defaultdb',
    user: 'avnadmin',
    password: process.env.DATABASEPASSWORD,
    ssl: {
        rejectUnauthorized: false,
        ca: process.env.CA_CERTIFICATE
    }
};
const db = pgp(dbConfig);

const addStory = (request, response) => {
    const { name, description, content, admin_id, in_progress } = request.body;

    if (!name || !description || !admin_id) {
        return response.status(400).json({ message: 'Todos los campos son requeridos' });
       
    }
    db.one('INSERT INTO story (name, description, content, admin_id, in_progress) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, description, content, admin_id, in_progress])
        .then(result => {
            response.status(201).json({ id: result.id });
        })
        .catch(error => {
            response.status(500).send(`Error adding story: ${error.message}`);
            console.log(error)
        });
};

const getStories = (request, response) => {
    db.any('SELECT * FROM story').then(results => {
        response.status(201).json(results);
    }).catch(error => {
        response.status(500).send(`Error getting stories: ${error.message}`);
    });
}
const login = async (request, response) => {
    const { email, password } = request.body;
    if (!email || !password) {
        return response.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await db.oneOrNone('SELECT email, password, name, id FROM users WHERE email = $1', [email]);
        if (!user) {
            return response.status(401).json({ message: 'User is not valid' });
        }
        const passwordMatch = await bcryptjs.compare(password, user.password);
        if (!passwordMatch) {
            return response.status(401).json({ message: 'Password is not valid' });
        }
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        response.status(200).json({ message: 'User authenticated', token, name: user.name, id: user.id, email: user.email });
    } catch (error) {
        console.error('Error during authentication:', error);
        response.status(500).send(`Error during authentication: ${error.message}`);
    }
};
const getStoryById = async (request, response) => {
    const { id } = request.body;
    try {
        const story = await db.one('SELECT * FROM story WHERE id = $1', [id]);
        response.status(200).json(story);
    } catch (error) {
        console.error('ERROR finding story:', error);
        response.status(500).json({ message: `Error fetching story: ${error.message}` });
    }
};
const getUserById = async (request, response) => {
    const { id } = request.body
    try {
        const user = await db.one('SELECT id, name, email from users where id = $1', [id]);
        response.status(200).json(user)
    } catch (error) {
        console.error('ERROR finding user:', error);
        response.status(500).json({ message: `Error fetching user: ${error.message}` });
    }
}
const updateStory = async (request, response) => {
    const { id, newContent } = request.body;
    if (!id || !newContent) {
        return response.status(400).json({ message: 'ID and new content are required' });
    }
    try {
        const story = await db.one('SELECT content FROM story WHERE id = $1', [id]);
        const updatedContent = story.content + ' ' + newContent;

        await db.none('UPDATE story SET content = $1 WHERE id = $2', [updatedContent, id]);
        response.status(200).json({ message: 'Story updated successfully' });
    } catch (error) {
        console.error('ERROR updating story:', error);
        response.status(500).json({ message: `Error updating story: ${error.message}` });
    }
};
const userRegister = async (request, response) => {
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
        return response.status(400).json({ message: 'All the data is required' });
    }
    try {
        const user = await db.one(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, crypt($3, gen_salt('bf'))) RETURNING *",
            [name, email, password]
        );
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        response.status(200).json({ token, name: user.name, id: user.id, email: user.email});
    } catch (error) {
        console.error('ERROR during registering user:', error);
        response.status(500).json({ message: `ERROR adding new user: ${error.message}` });
    }
};
const updateStoryState = async (request, response) => {
    const { in_progress, id } = request.body
    try {
        await db.none('UPDATE story SET in_progress = $1  WHERE id = $2 ', [in_progress, id]);
        response.status(200).json({ state: in_progress });
    } catch (error) {
        console.error('ERROR updating story:', error);
        response.status(500).json({ message: `Error updating story: ${error.message}` });
    }

}
const deleteStory = async (request, response) => {
    const { id } = request.body
    try {
        await db.none('DELETE FROM story WHERE id = $1', [id]);
        response.status(200).json({ message: 'Story has been deleted' })
    } catch (error) {
        console.error('ERROR deleting story:', error);
        response.status(500).json({ message: `Error deleting story: ${error.message}` });
    }
}
const deleteUser = async (request, response) => {
    const { id } = request.body
    try {
        await db.none('DELETE FROM users WHERE id = $1', [id]);
        response.status(200).json({ message: 'User has been deleted' })
    } catch (error) {
        console.error('ERROR deleting user:', error);
        response.status(500).json({ message: `Error deleting user: ${error.message}` });
    }
}


module.exports = {
    addStory,
    getStories,
    login,
    getStoryById,
    updateStory,
    userRegister,
    updateStoryState,
    getUserById,
    deleteStory,
    deleteUser
};
