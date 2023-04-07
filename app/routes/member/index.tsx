import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { FaMobileAlt } from "react-icons/fa";
import { requireMember, getMemberId } from "~/memberSession.server";
import { json, redirect } from "@remix-run/node";
import { getUpcomingInvitations, getMemberById } from "~/models/member.server";
import parseISO from "date-fns/parseISO";
import intlFormat from "date-fns/intlFormat";
import { useUser, formatEventDateForList } from "~/utils";
import { InvitationListItem } from "~/components/invitation_list_item";

export async function loader({ request }: LoaderArgs) {
  const member = await requireMember(request);
  const upcomingInvitations = await getUpcomingInvitations(member.id);

  return {
    member,
    upcomingInvitations,
  };
}

export default function MemberDashboard() {
  const { member, upcomingInvitations } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-screen-md space-y-12 py-8">
      <header className="flex justify-between">
        <h1 className="flex items-center space-x-2 font-bold">
          <FaMobileAlt />
          <span>
            <span className="text-red-600">Blood</span> on the Cellphone
          </span>
        </h1>

        <div className="flex items-baseline justify-end space-x-4">
          <p>Welcome {member?.name}</p>
          <Form action="/logout" method="post">
            <button type="submit" className="text-blue-500 underline">
              Log out
            </button>
          </Form>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Upcoming Events</h2>
        <ul>
          {upcomingInvitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex items-center justify-between rounded border border-gray-200 p-4 shadow"
            >
              <Link
                className="text-blue-600 underline"
                to={`invites/${invitation.id}`}
              >
                <div>
                  {invitation.event.schedule.title} @{" "}
                  {formatEventDateForList(invitation.event.dateTime)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
