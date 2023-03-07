import { useLoaderData, Link, Form } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/node";
import { getEvent, getUninvitedMembers } from "~/models/event.server";
import { InvitationListItem } from "~/components/invitation_list_item";
import parseISO from "date-fns/parseISO";
import format from "date-fns/format";
import formatDistance from "date-fns/formatDistance";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";

export async function loader({ params }: LoaderArgs) {
    const eventId = params['eventId']

    if (!eventId) {
        throw redirect('/dashboard')
    }

    const event = await getEvent({ eventId })

    const uninvitedMembers = await getUninvitedMembers({ eventId })

    if (!event) {
        throw redirect('/dashboard')
    }

    return {
        event,
        uninvitedMembers
    }
}

export default function EventDetailsPage() {
    const { event, uninvitedMembers } = useLoaderData<typeof loader>()

    return <div className='mx-auto py-8 max-w-screen-md space-y-8'>
        <Link className="text-blue-600 underline" to='/dashboard'>Back</Link>

        <h2 className='font-bold text-lg'>
            {event.schedule.title}
        </h2>

        <span>
            {format(
                parseISO(event.dateTime),
                "MMM dd 'at' h:mm b "
            )} <span className='italic'>
                ({formatDistance(
                    parseISO(event.dateTime),
                    new Date(),
                    { addSuffix: true }
                )})
            </span>
        </span>

        <section className="space-y-4">
            <h2 className="text-lg font-bold">Invitations</h2>
            <ul className="space-y-2">
                {event.invitations.map(invitation => (
                    <InvitationListItem
                        memberName={invitation.member.name}
                        scheduleTitle={event.schedule.title}
                        dateTime={event.dateTime}
                        status={invitation.status}
                    />
                ))}
            </ul>
        </section>

        {uninvitedMembers.length > 0 ? (
            <div className='bg-yellow-100 border border-yellow-300 rounded p-4 flex items-center gap-4'>
                <FaExclamationTriangle className='text-yellow-600' />
                Warning: Some members have not been invited to this event: {uninvitedMembers.map(member => member.name).join(', ')}
            </div>
        ) : (
            <div className='bg-green-100 border border-green-300 rounded p-4 flex items-center gap-4'>
                <FaCheck className='text-green-600' />
                All members have been invited
            </div>
        )}

        <section className="space-y-4">
            <h2 className='font-bold text-lg'>
                Actions
            </h2>

            <div className="flex items-center space-x-4">
                <Form action={`/event/${event.id}/sendInvites`} method="post" onSubmit={e => {
                    if (!confirm('Are you sure? This will send a text to every user who has not yet been invited.')) {
                        e.preventDefault()
                    }
                }}>
                    <button
                        aria-describedby="send-invites-description"
                        className="rounded bg-green-600 py-2 px-4 font-bold text-white"
                        type="submit"
                    >
                        Send Invites
                    </button>
                </Form>
                <span id="send-invites-description" className='text-sm italic text-gray-600'>
                    Only sends invites to members who have not yet been invited
                </span>
            </div>
        </section>
    </div>
}
