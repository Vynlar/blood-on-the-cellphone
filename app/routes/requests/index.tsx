import type { LoaderArgs } from "@remix-run/node";
import { Link, Form, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { getAllMembershipRequests } from "~/models/membership_request.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const membershipRequests = await getAllMembershipRequests();

  return {
    membershipRequests,
  };
}

export default function RequestsIndexPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto mt-8 max-w-screen-md space-y-4">
      <Link className="text-blue-600 underline" to="/dashboard">
        Back
      </Link>
      <h1 className="text-xl font-bold">Pending requests</h1>
      <ul>
        {data.membershipRequests?.map((request) => {
          return (
            <li key={request.id} className="flex items-center gap-4">
              {request.name ?? "No name"} ({request.phoneNumber})
              {request.name && (
                <Form action={`/requests/${request.id}/approve`} method="post">
                  <button
                    className="rounded bg-green-600 p-2 font-bold text-white"
                    type="submit"
                  >
                    Approve
                  </button>
                </Form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
