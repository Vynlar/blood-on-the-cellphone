import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { FaMobileAlt } from 'react-icons/fa'
import { requireUserId } from "~/session.server";
import { json } from "@remix-run/node";
import { getAllSchedules } from "~/models/schedule.server";
import { getAllInvitations } from "~/models/invitation.server";
import { getUpcomingEvents } from "~/models/event.server";
import parseISO from "date-fns/parseISO";
import intlFormat from "date-fns/intlFormat";
import { countMembershipRequests } from "~/models/membership_request.server";
import { useUser } from "~/utils";
import { InvitationListItem } from "~/components/invitation_list_item";


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

export default function DashboardPage() {
  const { schedules, invitations, membershipRequestCount, upcomingEvents } =
    useLoaderData<typeof loader>();

  const user = useUser()

  return (
    <div className='mx-auto py-8 max-w-screen-md space-y-12'>
      <header className="flex justify-between">
        <h1 className='font-bold flex space-x-2 items-center'><FaMobileAlt /><span><span className='text-red-600'>Blood</span> on the Cellphone</span></h1>

        <div className="flex space-x-4 justify-end items-baseline">
          <p>{user.email}</p>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="text-blue-500 underline"
            >
              Log out
            </button>
          </Form>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Upcoming Events</h2>
        <ul>
          {upcomingEvents.map((event) => (
            <li
              key={event.id}
              className="rounded border border-gray-200 p-4 shadow flex justify-between items-center"
            >
              <div>
                <div>
                  {event.schedule.title} @{" "}
                  {intlFormat(parseISO(event.dateTime), {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </div>
                <div className='font-bold'>
                  <span className='text-green-600'>
                    {event.invitations.filter(invitation => invitation.status === 'RESPONDED_YES').reduce((total, invite) => total + (invite.guests ?? 0) + 1, 0)}</span>/
                  <span className='text-red-600'>
                    {event.invitations.filter(invitation => invitation.status === 'RESPONDED_NO').length}</span>/
                  <span className='text-yellow-600'>
                    {event.invitations.filter(invitation => invitation.status === 'RESPONDED_MAYBE').length}</span>/
                  <span>
                    {event.invitations.filter(invitation => invitation.status === 'SENT').length}</span>
                </div>
              </div>
              <Link className='text-blue-600 underline' to={`/event/${event.id}`}>View details</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Invitations</h2>
        <ul className='space-y-2'>
          {invitations.map((invitation) => (
            <InvitationListItem
              memberName={invitation.member.name}
              scheduleTitle={invitation.event.schedule.title}
              dateTime={invitation.event.dateTime}
              guestCount={invitation.guests}
              status={invitation.status} />
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Membership Requests</h2>
        {membershipRequestCount > 0 ? (
          <Link className="text-blue-600 underline" to="/requests">
            Review {membershipRequestCount} requests
          </Link>
        ) : (
          <p>There are no outstanding membership requests</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Schedules</h2>
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
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Developer Utilities</h2>
        <Link className="block text-blue-600 underline" to="/sms">
          Test SMS messages
        </Link>
      </section>
    </div>
  );
}
