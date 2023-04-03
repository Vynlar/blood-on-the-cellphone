import React from "react";
import { LoaderArgs, redirect } from "@remix-run/node";
import { requireMemberId, getMemberId } from "~/memberSession.server";
import { getInvitation } from "~/models/invitation.server";
import { useLoaderData, Link, Form, useTransition } from "@remix-run/react";
import parseISO from "date-fns/parseISO";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";
import { FaQuestion, FaCheck, FaExclamation } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { useState } from "react";

export async function loader({ request, params }: LoaderArgs) {
  await requireMemberId(request);

  const invitationId = params["invitationId"];

  if (!invitationId) {
    throw redirect("/");
  }

  const invitation = await getInvitation(invitationId);

  if (!invitation) throw redirect("/member");

  return invitation;
}

export default function MemberInvitationIdRoute() {
  const invitation = useLoaderData<typeof loader>();
  const transition = useTransition();

  const [isEditing, setIsEditing] = useState(false);
  const [guestsInput, setGuestsInput] = useState(
    invitation.guests ? invitation.guests : 0
  );

  function handleGuestsInput(direction: string) {
    if (direction === "up" && guestsInput < 10) {
      setGuestsInput(guestsInput + 1);
    } else if (direction === "down" && guestsInput > 0) {
      setGuestsInput(guestsInput - 1);
    }
  }

  return (
    <div className="mx-auto max-w-screen-md space-y-8 py-8">
      <Link className="text-blue-600 underline" to="/member">
        Back
      </Link>

      <h2 className="text-lg font-bold">{invitation.event.schedule.title}</h2>

      <span>
        {format(parseISO(invitation.event.dateTime), "MMM dd 'at' h:mm b ")}{" "}
        <span className="italic">
          (
          {formatDistance(parseISO(invitation.event.dateTime), new Date(), {
            addSuffix: true,
          })}
          )
        </span>
      </span>

      <section className="space-y-4">
        {invitation.status === "SENT" && (
          <div className="flex items-center gap-4 rounded border border-yellow-300 bg-yellow-100 p-4">
            <FaExclamation className="text-yellow-600" />
            You have not responded to this RSVP.
          </div>
        )}
        {invitation.status === "RESPONDED_YES" && (
          <div className="flex items-center gap-4 rounded border border-green-300 bg-green-100 p-4">
            <FaCheck className="text-green-600" />
            You have replied YES to this RSVP and are bringing{" "}
            {invitation.guests} guests.
          </div>
        )}
        {invitation.status === "RESPONDED_NO" && (
          <div className="flex items-center gap-4 rounded border border-red-300 bg-red-100 p-4">
            <ImCross className="text-red-600" />
            You have replied NO to this RSVP.
          </div>
        )}
        {invitation.status === "RESPONDED_MAYBE" && (
          <div className="flex items-center gap-4 rounded border border-cyan-300 bg-cyan-100 p-4">
            <FaQuestion className="text-cyan-600" />
            You have replied MAYBE to this RSVP.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Actions</h2>
        <div className="flex items-center space-x-4">
          {!isEditing && (
            <button
              className="rounded bg-green-600 py-2 px-4 font-bold text-white"
              disabled={transition.state === "submitting"}
              onClick={() => setIsEditing(true)}
            >
              {invitation.status === "SENT" ? "RSVP" : "Update RSVP"}
            </button>
          )}
          {isEditing && (
            <Form action={`/member/${invitation.id}/update`} method="post">
              <fieldset>
                <legend>Will You Be Attending This Event?</legend>
                <input
                  type="radio"
                  id="yes-option"
                  name="answer"
                  value="RESPONDED_YES"
                  defaultChecked={invitation.status === "RESPONDED_YES"}
                />
                <label htmlFor="yes-option">Yes</label>

                <input
                  type="radio"
                  id="no-option"
                  name="answer"
                  value="RESPONDED_NO"
                  defaultChecked={invitation.status === "RESPONDED_NO"}
                />
                <label htmlFor="no-option">No</label>

                <input
                  type="radio"
                  id="maybe-option"
                  name="answer"
                  value="RESPONDED_MAYBE"
                  defaultChecked={invitation.status === "RESPONDED_MAYBE"}
                />
                <label htmlFor="maybe-option">Maybe</label>
              </fieldset>
              <div>
                <label htmlFor="guests-input">
                  How many additional guests will you bring?
                </label>
              </div>
              <div>
                <div className="flex flex-row">
                  <button
                    type="button"
                    className="rounded-l bg-slate-400 py-2 px-4 font-bold text-white"
                    onClick={() => handleGuestsInput("down")}
                  >
                    -
                  </button>
                  <div className="w-12 border py-2 px-4 text-center">
                    {guestsInput}
                  </div>
                  <input
                    hidden
                    id="guests-input"
                    type="number"
                    name="guests"
                    min="0"
                    value={guestsInput}
                    disabled
                  />
                  <button
                    type="button"
                    className="rounded-r bg-slate-400 py-2 px-4 font-bold text-white"
                    onClick={() => handleGuestsInput("up")}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                aria-describedby="send-invites-description"
                className="rounded bg-green-600 py-2 px-4 font-bold text-white"
                disabled={transition.state === "submitting"}
                type="submit"
              >
                {transition.state === "submitting" ? "Updating..." : "Update"}
              </button>
            </Form>
          )}
        </div>
      </section>
    </div>
  );
}
