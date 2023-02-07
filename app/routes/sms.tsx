import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import * as React from "react";
import makeTwilioClient from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = makeTwilioClient(accountSid, authToken);


export async function action({ request }: ActionArgs) {
    const formData = await request.formData();
    const message = formData.get('message')

    if(message && typeof message === 'string') {
        await client.messages.create({
            to: '+15058143896',
            from: '+18556439303',
            body: message,
        })

        return json(
            { message: "Sent!" },
            { status: 200 }
        );
    } else {
        return json(
            { message: "You must include a message." },
            { status: 400 }
        );
    }
}

export default function SMSPage() {
    const actionData = useActionData<typeof action>()

    return <Form method="post">
        <label htmlFor="message">Message</label>
        <input id='message' name='message' />
        <button type='submit'>Send</button>
        Message: {actionData?.message}
    </Form>
}
