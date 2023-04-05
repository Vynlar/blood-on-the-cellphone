import React from "react";
import { ActionArgs } from "@remix-run/server-runtime";
import { requireMemberId } from "~/memberSession.server";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/server-runtime";
import { updateInvitation } from "~/models/invitation.server";
import type { Invitation } from "~/models/invitation.server";

export async function action({ request, params }: ActionArgs) {
  const memberId = await requireMemberId(request);

  const formData = await request.formData();
  const status = String(formData.get("status"));
  let guests = Number(formData.get("guests"));
  const invitationId = params["invitationId"];

  if (status !== "RESPONDED_YES") {
    guests = 0;
  }

  if (typeof status !== "string") {
    return json(
      { errors: { title: "Status is not valid", body: null } },
      { status: 400 }
    );
  }

  if (typeof guests !== "number") {
    return json(
      { errors: { title: null, body: "Guest number is not valid" } },
      { status: 400 }
    );
  }

  if (typeof invitationId !== "string") {
    return json(
      { errors: { title: null, body: "Invalid invitation ID" } },
      { status: 400 }
    );
  }

  console.log("check", invitationId, status, guests);

  const invitation = await updateInvitation(invitationId, status, guests);

  return redirect(`/member/invites/${invitationId}`);
}
