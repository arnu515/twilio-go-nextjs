import { NextApiHandler } from "next"
import twilio, { accountSid, apiKey, apiSecret } from "lib/twilio"
import { jwt } from "twilio"
import mongoPromise from "lib/mongodb"
import { ObjectID } from "bson"

const handler: NextApiHandler = async (req, res) => {
	const body = req.body || req.query

	const callId = body.callId
	if (typeof body.nickname !== "string") {
		res.status(422).json({ error: "Please enter a nickname" })
		return
	}
	if (typeof callId !== "string") {
		res.status(404).json({ error: "Room not found" })
		return
	}

	const mongo = await mongoPromise
	const call = await mongo
		.db()
		.collection("calls")
		.findOne({ _id: new ObjectID(callId) })

	if (!call) {
		res.status(404).json({ error: "Room not found" })
		return
	}

	let room = null
	try {
		room = await twilio.video.rooms.get(call.roomSid).fetch()
	} catch {}

	if (!room) {
		res.status(404).json({ error: "Room not found" })
		return
	}
	if (room.participants.length > 1) {
		res.status(403).json({ error: "Room is full" })
		return
	}

	const grant = new jwt.AccessToken.VideoGrant({
		room: room.uniqueName
	})

	const token = new jwt.AccessToken(accountSid!, apiKey!, apiSecret!)

	token.addGrant(grant)
	token.identity = body.nickname

	res.json({ token: token.toJwt() })
}

export default handler
