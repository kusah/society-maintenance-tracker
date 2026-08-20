const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../models/db");

const register = async (req, res) => {
    try {
        const { name, email, password, flat_number } = req.body;

        // Basic validation
        if (!name || !email || !password || !flat_number) {
            return res.status(400).json({
                message: "Name, email, password and flat number are required"
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Always create a resident through public registration
        const result = await pool.query(
            `INSERT INTO users
            (name, email, password_hash, role, flat_number)
            VALUES ($1, $2, $3, 'resident', $4)
            RETURNING id, name, email, role, flat_number, created_at`,
            [name, email, passwordHash, flat_number]
        );

        res.status(201).json({
            message: "Resident registered successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                flat_number: user.flat_number
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login"
        });
    }
};


module.exports = {
    register,
    login
};