import { requireUserId } from "~/session.server";
import type { ActionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request);

  if (request.method !== "POST") {
    return json({ message: "Method not supported" }, { status: 405 });
  }
}
