import { json, redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";
import {
  approveMembershipRequest,
  getMembershipRequest,
} from "~/models/membership_request.server";

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);

  if (request.method !== "POST") {
    return json({ message: "Method not supported" }, { status: 405 });
  }

  invariant(params.requestId, "requestId is required");

  const requestId = params.requestId;
  const membershipRequest = await getMembershipRequest({ id: requestId });

  if (!membershipRequest) {
    return new Response("Not found", { status: 404 });
  }

  await approveMembershipRequest(membershipRequest);

  return redirect("/requests");
}
