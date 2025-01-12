const { response, request } = require('express');
const pgp = require('pg-promise')();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = {
    host: 'pg-367562eb-dannypanda5524-dd69.l.aivencloud.com',
    port: 27920,
    database: 'defaultdb',
    user: 'avnadmin',
    password: 'AVNS_Coe57B8ysx8ri396PeH',
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUSEMrD1qTmP+w61x0HUaoh0hr1+QwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvNjFlYzViZjgtMGVlNC00YzgwLWI2ODAtZjNhMGI4ZGZm
NzI4IFByb2plY3QgQ0EwHhcNMjUwMTEyMjMxMDA3WhcNMzUwMTEwMjMxMDA3WjA6
MTgwNgYDVQQDDC82MWVjNWJmOC0wZWU0LTRjODAtYjY4MC1mM2EwYjhkZmY3Mjgg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAJpkXyc8
I5PJcdtR6OQzc9oomtR8/eCJeBI/LEXprIv2KMOVGqpEaxRQRneHJ5LNLaFaBlnN
nzaLG9UOW9KhObXaGH2YqH4BnmRDE34QeY046vPfxRr1bmk8DBaRBMat+rWxX53r
U0C2/whdz/pXiwiWbaGjnylAKSuyl2fq7Gat2Crru4ttk33zOpBT4/uaQACvKB2S
Ot/a0ZMbjIsgmX2a9Baj91osMnBFyDvEhtnhtYAAaqk9NwMjhXyXHu74YepfbvwN
5Ox6XZCZFyjWPgblA++8NPMnCABagka5lVSZL2yWsvaNLW0+ALBFxfBcVCgXOeQ+
E26jH04stX6VHDE1D1Fn/m4V0COztVGd3IajqH05m4LyuW3JOQaQ9plj0wJBJ62d
JvVqWdOWGv5nuGanRvZuj/NMR5FVQhtfR2bks0XZRGkXPF5BgC6c3fI2868jOJ8z
+W5mpWIdbL9w24eySIbrV0YXjqTGV+icykL1mewPS52Oa0RD/M6S6WurdQIDAQAB
oz8wPTAdBgNVHQ4EFgQU+4h6M8L/SUKUoaxxsWi33Y8g6pgwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAAPATya3BGrFIZkJ
+l7aKnS2P9lddcTEyqMEHig1Yx5uVo+nGa5baUuGb1yjpquUOIcpLMH12fHApFaU
5ma5c+nYqtZU8GzvPVQVHIyjWnxsSsjOhxErcUdASfD4fEG95k1iw7LJg+SHyWsW
jzsObPdW7i2L4lQLGpHOiTszZavVZDnNd54t+PnF4pjvhtJDsp6VJ6LlAOEcOv+H
BQaC8ntB2FIxQvL5TK4hnOtb6/6FScMR7u8yfWh8/Uu7EfnYc26PMbdhSaGJGcne
9bRjcsVRChD8g5rWN5T0LgYdQ0xWNf2im3O6RXcX5yqvUQkoFuuROe+jtSUH52do
/oOxQCg2IxCVtVrrYumk5pWgIn/I4xThL/xlyvOxVGRixIgUb/VIgrg35T0T8lFa
FMaZQmqouv5X4g9AHACDxDuKaDIHxkBVJJDTEdXZR4mmrLtR/ryZvziJh0qcUibv
25/D+0vji7NCpGreVdWew7GZnbZ+Ohz63s5eomPBnvFlsOjJuQ==
-----END CERTIFICATE-----`,
    }
};
// const dbConfig = {
//     host: 'localhost',
//     port: 5433,
//     database: 'sharestory',
//     user: 'postgres',
//     password: 'nataf2712'
// };
const db = pgp(dbConfig);

const addStory = (request, response) => {
    const { name, description, content, admin_id, in_progress } = request.body;
    const image_url = request.file ? `http://localhost:3000/uploads/${request.file.filename}` : null;

    if (!name || !description || !admin_id) {
        return response.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    db.one('INSERT INTO story (name, description, content, admin_id, in_progress, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [name, description, content, admin_id, in_progress, image_url])
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
        response.status(200).json({ token, name: user.name, id: user.id });
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
