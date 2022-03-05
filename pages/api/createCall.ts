import m from "lib/mongodb"
import twilio from "lib/twilio"
import { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
	const mongo = await m

	const room = await twilio.video.rooms.create({
		type: "go",
		emptyRoomTimeout: 15,
		unusedRoomTimeout: 15
	})

	const call = await mongo.db().collection("calls").insertOne({
		createdAt: new Date(),
		roomSid: room.sid
	})

	res.redirect(`/call/${call.insertedId}`)
}

export default handler
