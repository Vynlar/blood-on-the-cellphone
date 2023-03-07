import { requireUserId } from "~/session.server";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { sendInvitations } from "~/models/event.server";

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);

  if (request.method !== "POST") {
    return json({ message: "Method not supported" }, { status: 405 });
  }

  const eventId = params['eventId']

  invariant(eventId, 'Event id is required')

  const failures = await sendInvitations({ eventId })
  console.log(failures)

  return redirect('/event/' + eventId)
}
