import React from "react"
import { GetServerSideProps, NextPage } from "next"
import twilio from "lib/twilio"
import { ObjectID } from "bson"
import { isSupported } from "twilio-video"
import Link from "next/link"
import Call from "lib/components/Call"

export const getServerSideProps: GetServerSideProps = async ({
	params,
	query
}) => {
	const _id = params?.slug as string
	const mongo = await (await import("lib/mongodb")).default

	const call = await mongo
		.db()
		.collection("calls")
		.findOne({ _id: new ObjectID(_id) })
	if (!call)
		return {
			notFound: true
		}

	// Check that the call's room exists
	try {
		const room = await twilio.video.rooms.get(call.roomSid).fetch()
		const token = typeof query.token === "string" ? query.token : null

		if (room.participants().length > 1) {
			return {
				props: { call: JSON.parse(JSON.stringify(call)), isFull: true, token }
			}
		}

		return {
			props: { call: JSON.parse(JSON.stringify(call)), isFull: false, token }
		}
	} catch (e) {
		console.log(e)
		// Delete call otherwise
		await mongo
			.db()
			.collection("calls")
			.deleteOne({ _id: new ObjectID(_id) })
		return {
			notFound: true
		}
	}
}

const CallSlug: NextPage<{
	call: any
	isFull: boolean
	token: string | null
}> = ({ call, isFull, token: tokenFromQs }) => {
	if (!isSupported)
		return (
			<div className="mx-4 my-4 max-w-screen-md bg-gray-200 p-4 md:mx-auto md:my-8">
				<h1 className="my-4 text-center text-5xl font-bold">
					Browser not supported
				</h1>
				<p className="text-mono mt-8 mb-4 text-center font-mono text-gray-500">
					Please upgrade your browser or switch to a newer browser to use this
					application.
				</p>
				<p className="mt-8 mb-4 text-center">
					<Link href="/">
						<a className="rounded bg-gray-500 px-4 py-2 text-white">Homepage</a>
					</Link>
				</p>
			</div>
		)

	if (isFull)
		return (
			<div className="mx-4 my-4 max-w-screen-md bg-gray-200 p-4 md:mx-auto md:my-8">
				<h1 className="my-4 text-center text-5xl font-bold">Call is full</h1>
				<p className="text-mono mt-8 mb-4 text-center font-mono text-gray-500">
					There are already two participants in this call. Please create a new
					call or wait for one of the participants to leave.
				</p>
				<p className="mt-8 mb-4 text-center">
					<a
						href="/api/createCall"
						className="mr-2 rounded bg-blue-500 px-4 py-2 text-white"
					>
						Create call
					</a>
					<Link href="/">
						<a className="rounded bg-gray-500 px-4 py-2 text-white">Homepage</a>
					</Link>
				</p>
			</div>
		)

	const [token, setToken] = React.useState<string | null>(tokenFromQs || null)
	const [nickname, setNickname] = React.useState("")

	async function joinCall() {
		if (!nickname.trim()) return alert("Please enter a nickname")
		const res = await fetch("/api/getAccessToken", {
			method: "POST",
			body: JSON.stringify({
				nickname: nickname.trim(),
				callId: call._id
			}),
			headers: {
				"Content-Type": "application/json"
			}
		})
		const data = await res.json()

		if (!res.ok) alert(data.error || "An error occured")
		else setToken(data.token)
	}

	if (!token)
		return (
			<div className="mx-4 my-4 max-w-screen-md bg-gray-200 p-4 md:mx-auto md:my-8">
				<h1 className="my-4 text-center text-5xl font-bold">Join call</h1>
				<p className="text-mono mt-8 mb-4 text-center font-mono text-gray-500">
					{call._id}
				</p>
				<p className="my-4 text-center">
					<input
						type="text"
						className="my-2 mx-auto block rounded border border-black bg-white px-2 py-1 outline-none focus:border-blue-500"
						placeholder="Your nickname"
						required
						value={nickname}
						onChange={e => setNickname(e.target.value)}
					/>
					<button
						onClick={joinCall}
						className="mr-2 rounded bg-blue-500 px-4 py-2 text-white"
					>
						Join call
					</button>
				</p>
			</div>
		)

	return <Call token={token} />
}

export default CallSlug
