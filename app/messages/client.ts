import makeTwilioClient from "twilio";

const sendingNumber = process.env.SENDING_NUMBER;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = makeTwilioClient(accountSid, authToken);

export async function sendMessage(phoneNumber: string, message: string) {
  if (process.env.NODE_END === 'production') {
    await client.messages.create({
      to: phoneNumber,
      from: sendingNumber,
      body: message,
    });
  } else {
    console.log(`FAKE: Sending message to ${phoneNumber} from ${sendingNumber} with message:\n\t${message}`)
  }
}
