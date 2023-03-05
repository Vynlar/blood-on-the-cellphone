import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { json, redirect } from "@remix-run/node";
import { getAllSchedules } from "~/models/schedule.server";
import { getAllInvitations } from "~/models/invitation.server";
import { getUpcomingEvents } from "~/models/event.server";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import intlFormat from "date-fns/intlFormat";
import { countMembershipRequests } from "~/models/membership_request.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const schedules = await getAllSchedules();
  const invitations = await getAllInvitations();
  const membershipRequestCount = await countMembershipRequests();
  const upcomingEvents = await getUpcomingEvents();

  return json({
    schedules,
    invitations,
    membershipRequestCount,
    upcomingEvents,
  });
}

function formatStatus(status: string): string {
  switch (status) {
    case "SENT":
      return "hasn't responded";
    case "RESPONDED_YES":
      return "is coming";
    case "RESPONDED_NO":
      return "is not coming";
    case "RESPONDED_MAYBE":
      return "may be coming";
  }
  return "";
}

export default function DashboardPage() {
  const { schedules, invitations, membershipRequestCount, upcomingEvents } =
    useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <div className="mx-auto mt-8 max-w-screen-md space-y-4">
        <h1 className="text-lg font-bold">Schedules</h1>
        <ul>
          {schedules.map((schedule) => (
            <li
              key={schedule.id}
              className="rounded border border-gray-200 p-4 shadow"
            >
              {schedule.title} ({schedule.cadence})
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 max-w-screen-md space-y-4">
        <h1 className="text-lg font-bold">Upcoming Events</h1>
        <ul>
          {upcomingEvents.map((event) => (
            <li
              key={event.id}
              className="rounded border border-gray-200 p-4 shadow flex justify-between items-center"
            >
              {event.schedule.title} @{" "}
              {intlFormat(parseISO(event.dateTime), {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
              <Form action={`/event/${event.id}/sendInvites`} method="post">
                <button
                  className="rounded bg-green-600 p-2 font-bold text-white"
                  type="submit"
                >
                  Send Invites
                </button>
              </Form>{" "}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 max-w-screen-md space-y-4">
        <h1 className="text-lg font-bold">Invitations</h1>
        <ul>
          {invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="rounded border border-gray-200 p-4 shadow"
            >
              <strong>{invitation.user.name}</strong> is invited to{" "}
              <strong>{invitation.event.schedule.title}</strong> at{" "}
              <strong>
                {format(
                  parseISO(invitation.event.dateTime),
                  "h:mm b 'on' MMM dd"
                )}
              </strong>{" "}
              and {formatStatus(invitation.status)}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-8 max-w-screen-md space-y-4">
        <h1 className="text-lg font-bold">Membership Requests</h1>
        {membershipRequestCount > 0 ? (
          <Link className="text-blue-600 underline" to="/requests">
            Review {membershipRequestCount} requests
          </Link>
        ) : (
          <p>There are no outstanding membership requests</p>
        )}
      </div>
    </div>
  );
}
