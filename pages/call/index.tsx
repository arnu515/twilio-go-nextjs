import React from "react"
import { NextPage } from "next"
import { useRouter } from "next/router"

const CallIndex: NextPage = () => {
	const router = useRouter()

	function joinCall(e: React.FormEvent) {
		e.preventDefault()

		const fd = new FormData(e.currentTarget as HTMLFormElement)
		const id = fd.get("id") as string

		if (id) {
			router.push("/call/" + id)
		}
	}

	return (
		<div className="mx-4 my-4 max-w-screen-md bg-gray-200 p-4 md:mx-auto md:my-8">
			<h1 className="my-4 text-center text-5xl font-bold">Join a call</h1>
			<p className="mt-8 mb-4 text-center">
				<form onSubmit={joinCall}>
					<input
						type="text"
						className="w-full rounded border border-black bg-white px-2 py-1 outline-none focus:border-blue-500"
						name="id"
						placeholder="Call ID"
						aria-label="Call ID"
					/>
					<p className="mt-4 text-left">
						<button className="rounded bg-blue-500 px-4 py-2 text-white">
							Join call
						</button>
					</p>
				</form>
			</p>
		</div>
	)
}

export default CallIndex
