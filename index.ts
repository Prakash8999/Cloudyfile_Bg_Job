import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config()
const PORT = process.env.PORT || 4001;


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