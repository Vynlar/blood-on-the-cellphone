import * as React from "react";
import { Form, useActionData } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/node";
import { handleMessage } from "~/messages/router";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const message = formData.get("message");
  const fromNumber = formData.get("from");

  if (
    fromNumber &&
    typeof fromNumber === "string" &&
    message &&
    typeof message === "string"
  ) {
    const { response } = await handleMessage(fromNumber, message);

    return {
      response,
    };
  }

  return {
    response: "Invalid request",
  };
}

export default function SMSPage() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <h2>Demo SMS page</h2>
      <p>
        Use this page to test our SMS functionality without actually having to
        use a phone or send any texts.
      </p>

      <label htmlFor="from">From</label>
      <input id="from" name="from" defaultValue="+15058143896" />

      <label htmlFor="message">Message</label>
      <input id="message" name="message" />

      <button type="submit">Send</button>

      {actionData?.response}
    </Form>
  );
}
