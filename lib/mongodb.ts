import { MongoClient } from "mongodb"

const mongoPromise: Promise<MongoClient> =
	(global as any).mongoPromise || MongoClient.connect(process.env.MONGODB_URL!)

if (process.env.NODE_ENV === "development")
	(global as any).mongoPromise = mongoPromise

export default mongoPromise
