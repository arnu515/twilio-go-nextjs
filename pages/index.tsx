import { NextPage } from "next"
import Link from "next/link"

const Index: NextPage = () => {
	return (
		<div className="mx-4 my-4 max-w-screen-md bg-gray-200 p-4 md:mx-auto md:my-8">
			<h1 className="my-4 text-center text-5xl font-bold">Twilio Go Demo</h1>
			<p className="mt-8 mb-4 text-center">
				<a
					href="/api/createCall"
					className="mr-2 rounded bg-blue-500 px-4 py-2 text-white"
				>
					Create call
				</a>
				<Link href="/call">
					<a className="rounded bg-gray-500 px-4 py-2 text-white">Join call</a>
				</Link>
			</p>
		</div>
	)
}

export default Index
