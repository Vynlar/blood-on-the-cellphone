import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export default function AdminPage() {
  const user = useOptionalUser();
  return (
    <>
      <div className="mx-auto mt-64 flex max-w-sm flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-3xl font-bold">Blood on the Cellphone</h1>
          <p>SMS-based Blood on the Clocktower RSVP tracker</p>
        </div>
        {user ? (
          <Link to="/dashboard">Go to dashboard</Link>
        ) : (
          <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <Link
              to="/join"
              className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
