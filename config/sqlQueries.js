
export const getUserQuery =`SELECT * FROM users WHERE id = $1`;

export const createUserQuery = `INSERT INTO users(student_id, email, password, pseudonym, branch)
    VALUES($1,$2,$3,$4,$5)`

export const existingUserQuery = `SELECT * FROM users WHERE student_id = $1 OR email = $2 OR pseudonym = $3`;

export const loginUserQuery=`SELECT * FROM users WHERE student_id = $2 OR pseudonym = $1`;
