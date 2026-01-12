import pg from 'pg';
import env from 'dotenv';


if(process.env.NODE_ENV!== 'production'){
    env.config()
}

const DBConnect = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV==='production' ? { rejectUnauthorized: false}:false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis:2000
});

DBConnect.connect().then(()=>{
    console.log("Database Connected Successfully");
}).catch((err)=>{
    console.log("Database Connection Failed: ", err.message);
});

export const query = (text,params)=>{
   return DBConnect.query(text,params);
}