import {query} from "../config/dbConnect.js";
import { createUserQuery, existingUserQuery, loginUserQuery } from "../config/sqlQueries.js";
import bcrypt from 'bcrypt';
import env from 'dotenv';
import jwt from 'jsonwebtoken';
env.config();

// Login Request Logic
export async function loginUser(req,res){
    const {student_id,password}=req.body;
    if(!student_id || !password){
        return res.status(400).json({message:"Please enter all fields"})
    }

    const identifier = student_id.trim();
    const upperIdentifier=identifier.toUpperCase();
    
    try{
        const data = await query(loginUserQuery,[identifier,upperIdentifier]);

        // Check that user is auvailable or not
        if(data.rowCount<=0){
            return res.status(404).json({message:"Invalid ID/Username or Password"});
        }

        // Match/Compare the hashed password with the password which user enters to login
        const isMatch = await bcrypt.compare(password,data.rows[0].password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid ID/Username or Password"});
        }

        // Generating the token for login session. (making Digital Id Card)
        const token = jwt.sign(
            {id: data.rows[0].id, pseudonym: data.rows[0].pseudonym, branch: data.rows[0].branch},process.env.SECRET_JWT_CODE,{expiresIn:"24h"}
        )

        return res.status(200).json({message:"Login Successfull",token:token, pseudonym: data.rows[0].pseudonym});
    }catch(err){
        console.log("Login Error: ",err)
        return res.status(400).json({message:"Something went wrong on the server"});
    }
}

// Sign up Request Logic
export async function createUser(req,res){
    const {student_id, email, password, pseudonym, branch, secret_code}=req.body;

     // Check for the missing field
    if(!student_id|| !email|| !password|| !pseudonym|| !branch || !secret_code){
        return res.status(400).json({message:"Missing Fields"})
    }

    const normalizeId= student_id.trim().toUpperCase();
    const normalizeEmail=email.trim().toLowerCase();
    try{
        // Checking the secret chat code which confirms that the user is from the university 
        if(secret_code===process.env.SECRET_CHAT_CODE){
            const existingUser = await query(existingUserQuery,[normalizeId,normalizeEmail,pseudonym]);

            // Check that user already exist or not
            if(existingUser.rows.length>0){
                const student = existingUser.rows[0];
                if(student.student_id===normalizeId){
                    return res.status(400).json({message:"Student ID Already Exist"});
                }
                if(student.email===normalizeEmail){
                    return res.status(400).json({message:"Email Already Exist"});
                }
                if(student.pseudonym===pseudonym){
                    return res.status(400).json({message:"Username Already Exist"});
                }
            }


            // Hashing the password and storing into Database
            const pass=await bcrypt.hash(password,10)

            // Here Runs the Insert query to insert the data of new user into database
            await query(createUserQuery,[normalizeId, normalizeEmail, pass, pseudonym, branch]);

            return res.status(201).json({message:"Registration Successful! You can now login. "});
        }else{
            return res.status(400).json({message:"Invalid Code"});
        }
    }catch(err){
        console.log("Signup Error: ", err);
        return res.status(401).json({message:"User creation failed"});
    }
}
