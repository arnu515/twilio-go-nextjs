import Twilio from "twilio"

export const accountSid = process.env.TWILIO_ACCOUNT_SID
export const apiKey = process.env.TWILIO_API_KEY
export const apiSecret = process.env.TWILIO_API_SECRET

const twilio: Twilio.Twilio =
	(global as any).twilio || Twilio(apiKey, apiSecret, { accountSid })

if (process.env.NODE_ENV === "development") (global as any).twilio = twilio

export default twilio
