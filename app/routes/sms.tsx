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
    <div className="mx-auto mt-8 max-w-screen-md space-y-4">
      <Form method="post" className="space-y-4">
        <div>
          <h2 className="font-bold">Demo SMS page</h2>
          <p>
            Use this page to test our SMS functionality without actually having
            to use a phone or send any texts.
          </p>
        </div>

        <div className="flex flex-col">
          <label htmlFor="from">From</label>
          <input
            className="rounded border border-gray-400 p-2"
            id="from"
            name="from"
            defaultValue="+15058143896"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="message">Message</label>
          <input
            className="rounded border border-gray-400 p-2"
            id="message"
            name="message"
          />
        </div>

        <button
          className="rounded bg-green-600 p-2 font-bold text-white"
          type="submit"
        >
          Send
        </button>

        <div>{actionData?.response}</div>
      </Form>
    </div>
  );
}
