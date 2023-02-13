import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { twiml } from 'twilio'
import { handleMessage } from "~/messages/router";
const { MessagingResponse } = twiml

export async function loader({ request, params }: LoaderArgs) {
    const response = new MessagingResponse()
    const url = new URL(request.url);
    const fromNumber = url.searchParams.get("From");
    const message = url.searchParams.get("Body");

    if(fromNumber && typeof fromNumber === 'string' &&
        typeof message === 'string') {
        const result = await handleMessage(fromNumber, message)

        response.message(result.response)

        return new Response(response.toString(), {
            status: 200,
            headers: {
                "Content-Type": "text/xml",
            },
        });
    }
}
