import React from "react";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import parseISO from "date-fns/parseISO";
import { createNewEvent } from "~/models/event.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const date = form.get("date");
  const time = form.get("time");

  const parsedDate = parseISO(`${date}T${time}`);
  const scheduleId = "clerv6tks00006sac2gvzakzm";

  await createNewEvent({
    date: parsedDate,
    scheduleId,
  });

  return redirect("/dashboard");
};

export default function NewEventFormRoute() {
  return (
    <div>
      <p>Create an event!</p>
      <form method="post">
        <label htmlFor="date">Date:</label>
        <input id="date" name="date" type="date" />

        <label htmlFor="time">Time:</label>
        <input id="time" name="time" type="time" />

        <button>Submit</button>
      </form>
    </div>
  );
}
