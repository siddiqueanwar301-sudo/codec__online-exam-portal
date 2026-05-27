const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: "Database Connect!", time: result.rows[0].now });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Connection fail ho.");
    }
});

app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExist.rows.length > 0) {
            return res.status(401).json({ error: "email already registered"});
        }
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, password, role || 'student']
        );
        res.json({ message: "User successfully registered!", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found"});
        }
        if (user.rows[0].password !== password) {
            return res.status(401).json({ error: "wrong password"});
        }
        
        res.json({ message: "Login successful!", user: user.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
app.get('/questions', async (req, res) => {
    try {
        
        const allQuestions = await pool.query("SELECT * FROM questions");
        
        
        res.json(allQuestions.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.post('/add-question', async (req, res) => {
    try {
        const { question_text, opt_a, opt_b, opt_c, opt_d, correct_answer } = req.body;
        
        
        const newQuestion = await pool.query(
            "INSERT INTO questions (question_text, opt_a, opt_b, opt_c, opt_d, correct_answer) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [question_text, opt_a, opt_b, opt_c, opt_d, correct_answer]
        );
        
        res.json({ message: "✅ Question Successfully Added to Database!", question: newQuestion.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});