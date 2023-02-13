import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { json, redirect } from "@remix-run/node";
import { getAllSchedules } from "~/models/schedule.server";
import { getAllInvitations } from "~/models/invitation.server";
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'

export async function loader({ request }: LoaderArgs) {
    await requireUserId(request);

    const schedules = await getAllSchedules()
    const invitations = await getAllInvitations()

    return json({
        schedules,
        invitations
    })
}

function formatStatus(status: string): string {
    switch(status) {
            case 'SENT': return "hasn't responded";
            case 'RESPONDED_YES': return "is coming";
            case 'RESPONDED_NO': return "is not coming";
            case 'RESPONDED_MAYBE': return "may be coming";
    }
    return ''
}

export default function DashboardPage() {
    const { schedules, invitations } = useLoaderData<typeof loader>()

    console.log(invitations)

    return <div className="space-y-8">
        <div className='max-w-screen-md mx-auto mt-8 space-y-4'>
            <h1 className="text-lg font-bold">Schedules</h1>
            <ul>
                {schedules.map(schedule => (
                    <li key={schedule.id} className="border border-gray-200 rounded shadow p-4">{schedule.title} ({schedule.cadence})</li>
                ))}
            </ul>
        </div>

        <div className='max-w-screen-md mx-auto mt-8 space-y-4'>
            <h1 className="text-lg font-bold">Invitations</h1>
            <ul>
                {invitations.map(invitation => (
                    <li
                        key={invitation.id}
                        className="border border-gray-200 rounded shadow p-4">

                        <strong>{invitation.user.name}</strong>{' '}
                        is invited to{' '}
                        <strong>{invitation.event.schedule.title}</strong>{' '}
                            at{' '}
                        <strong>{format(parseISO(invitation.event.dateTime), "h:mm b 'on' MMM dd")}</strong>{' '}
                        and{' '} {formatStatus(invitation.status)}
                    </li>
                ))}
            </ul>
        </div>
    </div>
}
