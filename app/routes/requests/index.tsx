import type { LoaderArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { requireUserId } from "~/session.server";
import { getAllMembershipRequests } from "~/models/membership_request.server";

export async function loader({ request }: LoaderArgs) {
    await requireUserId(request)

    const membershipRequests = await getAllMembershipRequests()

    return {
        membershipRequests
    }
}

export default function RequestsIndexPage() {
    const data = useLoaderData<typeof loader>()

    return <div>
        <h1 className="font-bold text-xl">Pending requests</h1>
        <ul>
            {data.membershipRequests?.map((request) => {
                return (
                    <li key={request.id} className="flex items-center gap-4">
                        {request.name ?? 'No name'} ({request.phoneNumber})
                        {request.name && (
                            <Form action={`/requests/${request.id}/approve`} method='post'>
                                <button className="bg-green-600 font-bold text-white p-2 rounded" type="submit">Approve</button>
                            </Form>
                        )}
                    </li>
                )
            })}
        </ul>
    </div>
}
