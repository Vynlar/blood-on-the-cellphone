import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { json, redirect } from "@remix-run/node";
import { getAllSchedules } from "~/models/schedule.server";

export async function loader({ request }: LoaderArgs) {
    await requireUserId(request);

    const schedules = await getAllSchedules()

    return json({
        schedules
    })
}

export default function SchedulesIndexPage() {
    const { schedules } = useLoaderData<typeof loader>()

    return <div className='max-w-screen-md mx-auto mt-8 space-y-4'>
        <h1 className="text-lg font-bold">Schedules</h1>
        <ul>
            {schedules.map(schedule => <li className="border border-gray-200 rounded shadow p-4">{schedule.title} ({schedule.schedule})</li>)}
        </ul>
    </div>
}
