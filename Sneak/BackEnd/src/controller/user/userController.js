import { User } from '../../models/index.js'
import bcrypt from 'bcrypt';


/**
 * User Controller
 * Handles all user-related CRUD operations
 * Includes authentication and authorization checks
 */


/**
 * Fetch all users from database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with users data
 */
const getAll = async (req, res) => {
    try {
        // Check if user is admin - security validation
        if (!req.user || (!req.user.role || req.user.role !== 'admin') && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }
        
        // Fetching all the data from users table
        const users = await User.findAll();
        
        // Send successful response with users data
        res.status(200).send({ 
            data: users, 
            message: "successfully fetched data" 
        });
    } catch (e) {
        // Handle database or server errors
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

/** 
 *  create new user
*/

const create = async (req, res) => {

    try {
        const body = req.body
        console.log(req.body)
        //validation
        if (!body?.email || !body?.name || !body?.password)
            return res.status(400).send({ message: "Invalid payload" });
        const existingUser = await User.findOne({ where: { email: body.email } });
        if (existingUser) {
            return res.status(400).send({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const user = await User.create({
            name: body.name,
            email: body.email,
            password: hashedPassword,
            role: body.role || 'user'
        });
        res.status(201).send({ data: user, message: "successfully created user" })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: 'Failed to create user' });
    }
}

/**
 *  update existing user
 */

const update = async (req, res) => {

    try {
        const { id = null } = req.params;
        const body = req.body;
        console.log(req.params)
        //checking if user exist or not
        const oldUser = await User.findOne({ where: { id } })
        if (!oldUser) {
            return res.status(404).send({ message: "User not found" });
        }
        
        // Hash password if provided
        let hashedPassword = oldUser.password;
        if (body.password) {
            hashedPassword = await bcrypt.hash(body.password, 10);
        }
        
        oldUser.name = body.name;
        oldUser.password = hashedPassword;
        oldUser.email = body.email
        oldUser.save();
        res.status(200).send({ data: oldUser, message: "user updated successfully" })
    } catch (e) {
        console.log(e)
        res.status(500).json({ error: 'Failed to update users' });
    }
}

/**
 *  delete user 
 */
const deleteById = async (req, res) => {

    try {
        const { id = null } = req.params;
        const oldUser = await User.findOne({ where: { id } })

        //checking if user exist or not
        if (!oldUser) {
            return res.status(404).send({ message: "User not found" });
        }

        // Prevent deleting admin users
        if (oldUser.role === 'admin') {
            return res.status(403).send({ message: "Cannot delete admin users" });
        }

        // Prevent deleting the default admin user
        if (oldUser.email === 'sushantdhakal@gmail.com') {
            return res.status(403).send({ message: "Cannot delete the default admin user" });
        }

        oldUser.destroy();
        res.status(200).send({ message: "user deleted successfully" });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
}

/**
 *  fetch user by id
 */
const getById = async (req, res) => {

    try {
        const { id = null } = req.params;
        const user = await User.findOne({ where: { id } })
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "user fetched successfully", data: user })
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}


export const userController = {
    getAll,
    create,
    getById,
    deleteById,
    update
}