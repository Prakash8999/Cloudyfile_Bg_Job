import { GetObjectCommand, S3Client, PutObjectCommand, ListObjectsV2Command, DeleteBucketCommand, DeleteObjectCommand, HeadObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from 'dotenv'
import { UploadFiles } from "../interfaces/fileInterfaces";
import { boolean } from "zod";
config()


// console.log( "Starting...", process.env.Region ,process.env.AccessKeyId, process.env.SecretAccessKey  );


const s3Client = new S3Client({
	region: process.env.Region,
	credentials: {
		accessKeyId: process.env.AccessKeyId!,
		secretAccessKey: process.env.SecretAccessKey!,
	}
});


// export const putObject = async (fileData: UploadFiles) => {
// 	try {
// 		const { fileType, fileName, contentType, userId, uuid } = fileData;
// 		// console.log("file data ", fileType)
// 		const command = new PutObjectCommand({
// 			Bucket: process.env.BucketName!,
// 			Key: `uploads/users/${userId}/${uuid + "_" + fileName}`,
// 			ContentType: contentType,
// 		})
// 		const url = await getSignedUrl(s3Client, command)
// 		// return {
// 		// 	success:true,
// 		// 	signedUrl: url
// 		// }
// 		// console.log("new url ", url);
// 		// return url
// 		return { error: false, signedUrl: url, message: "File url generated successfully" }
// 	} catch (error: any) {
// 		console.log("error ", error)
// 		return {
// 			error: true,
// 			signedUrl: null,
// 			message: error?.message,
// 		}
// 		// throw error

// 	}
// }



export const deleteObject = async (keys: string[], BucketName:string) => {
	try {
		// const command = new DeleteObjectCommand({
		// 	Bucket: process.env.BucketName!,
		// 	Key: key,
		
		// });
		const command = new DeleteObjectsCommand({
			Bucket: BucketName,
			Delete: {
				Objects: keys.map((key) => ({ Key: key })),
				Quiet: false, // Set true if you don't need list of deleted keys
			},
		});




		const deleteData = await s3Client.send(command);
		console.log("deleteData ", deleteData)
		const statusCode = deleteData?.$metadata?.httpStatusCode;

		if (statusCode === 204 || statusCode === 200) {
			return {
				status: 200,
				message: "File deleted successfully",
				error: false,
			};
		} else {
			return {
				status: statusCode || 500,
				message: "Unexpected status code received",
				error: true,
			};
		}
	} catch (error: any) {
		console.error("Error deleting object:", error);
		return {
			status: 500,
			message: error.message || "Unknown error",
			error: true,
		};
	}
};