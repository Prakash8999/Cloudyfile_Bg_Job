import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config()
const PORT = process.env.PORT || 4001;

import redisClient, { connectRedis } from './src/utils/redis';
async function initApp() {
  try {
    await connectRedis();
    const result = await redisClient.ping();
    console.log('Redis is working! PING =>', result);
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
}

initApp();


app.get('/',(req:Request, res:Response) =>{
	
	res.send({
	staus: true,
	message:"success"
})
})

import  './src/queue/thumbnailWorker';





app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});