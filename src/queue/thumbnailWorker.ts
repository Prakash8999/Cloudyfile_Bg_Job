import { Worker } from 'bullmq';
import sequelize from '../db/Connection';
import { Op, QueryTypes } from 'sequelize';
import { FileAttributes } from '../models/files.model';
import { deleteObject } from '../utils/s3Client';





const deleteFiles = async (ids: number[]) => {
	try {
		console.log("ids ", ids)

		const query = `SELECT id, file_uid , s3_key, thumbnail_key FROM file_attributes WHERE id IN (${ids.join(',')})`
		const readResponse = await sequelize.query(query, {
			type: QueryTypes.SELECT
		})
		console.log("result ", readResponse)
		const ogFilesKey = readResponse.map((file: any) => file.s3_key)
		const thumbnailKeys = readResponse
			.map((file: any) => file.thumbnail_key)
			.filter((key: any) => key != null);
		console.log("og ", ogFilesKey)
		console.log("thumbnailKeys ", thumbnailKeys)


		const deleteFile = await deleteObject(ogFilesKey, process.env.BucketName!)
		console.log("delete File", deleteFile)

		if (deleteFile.error) {
			// errorHandler(res, deleteFile.message, deleteFile.status, {});
			throw {
				message: deleteFile.message,
				statusCode: deleteFile.status
			}

		}

		if (thumbnailKeys.length > 0) {
			const deleteThumbnail = await deleteObject(thumbnailKeys, process.env.PublicBucketName!)
			console.log("deleteThumbnail ", deleteThumbnail)

		}

		await FileAttributes.destroy({
			where: {
				id: {
					[Op.in]: ids
				}
			}
		})

		// Count files in FolderFileMap
		const countQuery = `SELECT COUNT(*) as count FROM folder_file_map WHERE file_id IN (${ids.join(',')})`;
		const countResult = await sequelize.query(countQuery, { type: QueryTypes.SELECT }) as Array<{ count: number }>;
		const ifFileExistInFolder = countResult[0].count;

		if (ifFileExistInFolder > 0) {
			const deleteQuery = `DELETE FROM folder_file_map WHERE file_id IN (${ids.join(',')})`;
			await sequelize.query(deleteQuery, { type: QueryTypes.DELETE });
		}


		// await redisClient.incr(`user:fileDataVersion:${userId}`);

	} catch (error) {
		console.log(error)
	}
}

export const worker = new Worker('delete-files-permanently', async job => {
	const { fileIds } = job.data;
	console.log("Processing job for fileId:", fileIds);
	// const ids = fileIds.map(Number)
	await deleteFiles(fileIds)


}, {
	connection: {
		url: process.env.REDIS_URI,

	}
})


console.log("Thumbnail worker started and listening for jobs...");