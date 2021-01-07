const express = require('express')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express()
const port = 3000

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


const USERS_LIST = [
    {id: 1, username: 'kamil', password: 'moje', role: 'admin'},
    {id: 2, username: 'lukasz', password: 'twoje', role: 'admin'},
    {id: 3, username: 'guest', password: 'inne', role: 'guest'},
]
SECRET = 'my-big-secret';


app.post('/', (req, res) => {
    const user = USERS_LIST.filter((u) => u.username == req.body.username);
    if(user.length === 0) {
        res.status(403).send("Wrong user");
        return;
    }

    if(user[0].password != req.body.password) {
        res.status(403).send("Wrong password");
        return;
    }

    const userData = {id: user[0].id, username: user[0].username, role: user[0].role};

    const token = jwt.sign(userData, SECRET, { expiresIn: '60s' });
    const refreshToken = jwt.sign(userData, SECRET, { expiresIn: '600s' });

    res.send(JSON.stringify({token, refreshToken}))
});
  
app.post('/refresh', (req, res) => {
    var refreshToken = req.body.refreshToken;

    try {
        var userData = jwt.verify(refreshToken, SECRET);
    } catch(err) {
        res.status(403).send("Token expired");
        return;
    }
    
    const user = USERS_LIST.filter((u) => u.id == userData.id);
    userData = {id: user[0].id, username: user[0].username, role: user[0].role};

    const token = jwt.sign(userData, SECRET, { expiresIn: '60s' });
    refreshToken = jwt.sign(userData, SECRET, { expiresIn: '600s' });

    res.send(JSON.stringify({token, refreshToken}))
});


app.post('/protected', (req, res) => {
    var token = req.body.token;

    try {
        var userData = jwt.verify(token, SECRET);
    } catch(err) {
        res.status(403).send("Restricted area");
        return;
    }

    res.send({"Who is breathtaking?": userData.username, "role": userData.role});
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

