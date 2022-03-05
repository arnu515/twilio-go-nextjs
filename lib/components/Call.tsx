import React from "react"
import video from "twilio-video"

const Call: React.FC<{ token: string }> = ({ token }) => {
	const [micButtonEnabled, setMicButtonEnabled] = React.useState(false)
	const [cameraButtonEnabled, setCameraButtonEnabled] = React.useState(false)
	const [connectedRoom, setConnectedRoom] = React.useState<video.Room | null>(
		null
	)
	const [audioTrack, setAudioTrack] =
		React.useState<video.LocalAudioTrack | null>(null)
	const [videoTrack, setVideoTrack] =
		React.useState<video.LocalVideoTrack | null>(null)
	const [otherParticipant, setOtherParticipant] =
		React.useState<video.Participant | null>(null)
	const view = React.useRef<HTMLVideoElement>(null)

	function setParticipant(p?: video.RemoteParticipant | null) {
		if (!p) {
			view.current!.srcObject = null
			setOtherParticipant(null)
			return
		}

		function publishTrack(publication: video.RemoteTrackPublication) {
			if (publication.isSubscribed) {
				;(publication.track as any).attach(view.current)
			}
			publication.on("subscribed", track => {
				;(track as any).attach(view.current)
			})
			publication.on("unsubscribed", track => {
				;(track as any).detach().forEach((e: any) => {
					e.srcObject = null
					e.remove()
				})
			})
		}

		p.tracks.forEach(publishTrack)
		p.on("trackPublished", publishTrack)
		setOtherParticipant(p)
	}

	React.useEffect(() => {
		if (!connectedRoom) {
			// In development, useEffect can run even when we are connected to room
			// so make sure we're not connected before proceeding
			video
				.connect(token, {
					audio: false,
					video: false
				})
				.then(room => {
					room.participants.forEach(p => setParticipant(p))

					room.on("participantConnected", p => {
						setParticipant(p)
					})
					room.on("participantDisconnected", () => {
						setParticipant(null)
					})
					room.on("participantReconnecting", () => {
						setParticipant(null)
					})
					room.on("participantReconnected", p => {
						setParticipant(p)
					})

					setConnectedRoom(room)

					console.log(room)
				})
		}

		navigator.mediaDevices.enumerateDevices().then(devices => {
			devices.forEach(device => {
				if (device.kind === "audioinput") {
					setMicButtonEnabled(true)
				}
				if (device.kind === "videoinput") {
					setCameraButtonEnabled(true)
				}
			})
		})

		return () => {
			connectedRoom?.disconnect?.()
		}
	}, [])

	if (!connectedRoom)
		return (
			<div className="mx-4 my-4 max-w-screen-md p-4 md:mx-auto md:my-8">
				<h1 className="my-4 text-center text-5xl font-bold">Connecting...</h1>
			</div>
		)

	const toggleMute = async () => {
		if (!micButtonEnabled) return
		if (!audioTrack) {
			const track = await video.createLocalAudioTrack({
				echoCancellation: true,
				noiseSuppression: true
			})
			connectedRoom.localParticipant.publishTrack(track)
			setAudioTrack(track)
		} else {
			audioTrack.stop()
			connectedRoom.localParticipant.unpublishTrack(audioTrack)
			setAudioTrack(null)
		}
	}

	const toggleCamera = async () => {
		if (!cameraButtonEnabled) return
		if (!videoTrack) {
			const track = await video.createLocalVideoTrack({
				aspectRatio: 4 / 3
			})
			connectedRoom.localParticipant.publishTrack(track)
			setVideoTrack(track)
		} else {
			videoTrack.stop()
			connectedRoom.localParticipant.unpublishTrack(videoTrack)
			setVideoTrack(null)
		}
	}

	return (
		<div className="mx-4 my-4 max-w-screen-md p-4 md:mx-auto md:my-8">
			<h1 className="my-4 text-center text-5xl font-bold">In a call</h1>
			<div className="my-4 flex items-center justify-center gap-2">
				<button
					className={`rounded ${
						micButtonEnabled
							? "cursor-pointer bg-green-500"
							: "cursor-not-allowed bg-gray-500"
					} p-2 text-white`}
					onClick={toggleMute}
					title={
						micButtonEnabled
							? audioTrack
								? "Mute"
								: "Unmute"
							: "Microphone not detected"
					}
					aria-label={
						micButtonEnabled
							? audioTrack
								? "Mute"
								: "Unmute"
							: "Microphone not detected"
					}
					disabled={!micButtonEnabled}
				>
					{!audioTrack ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
								clipRule="evenodd"
							/>
						</svg>
					)}
				</button>
				<button
					className={`rounded ${
						cameraButtonEnabled
							? "cursor-pointer bg-blue-500"
							: "cursor-not-allowed bg-gray-500"
					} p-2 text-white`}
					onClick={toggleCamera}
					title={
						cameraButtonEnabled
							? videoTrack
								? "Turn camera off"
								: "Turn camera on"
							: "Microphone not detected"
					}
					aria-label={
						cameraButtonEnabled
							? videoTrack
								? "Turn camera off"
								: "Turn camera on"
							: "Microphone not detected"
					}
					disabled={!cameraButtonEnabled}
				>
					{!videoTrack ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							{" "}
							<path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
						</svg>
					)}
				</button>
				<button className="rounded bg-orange-500 p-2 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					{/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
</svg> */}
				</button>
				<button className="rounded bg-red-500 p-2 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
						/>
					</svg>
				</button>
				<button
					className="rounded bg-gray-500 p-2 text-white"
					onClick={() => console.log(connectedRoom)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
						/>
					</svg>
				</button>
			</div>

			<div className="m-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
				{otherParticipant ? (
					<>
						<video ref={view} className="mx-auto bg-black"></video>
						<p className="text-center text-2xl font-medium text-gray-500">
							{otherParticipant.identity}
						</p>
					</>
				) : (
					<p className="my-4 text-center text-2xl font-medium text-gray-500">
						Waiting for another person to connect...
					</p>
				)}
			</div>
		</div>
	)
}
export default Call
