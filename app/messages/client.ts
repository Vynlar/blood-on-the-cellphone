import makeTwilioClient from 'twilio'

const sendingNumber = process.env.SENDING_NUMBER
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = makeTwilioClient(accountSid, authToken);

export async function sendMessage(phoneNumber: string, message: string) {
    await client.messages.create({
        to: phoneNumber,
        from: sendingNumber,
        body: message,
    })
}
