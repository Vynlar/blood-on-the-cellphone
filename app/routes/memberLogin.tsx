import React from "react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { getMemberByToken } from "~/models/member.server";
import { createMemberSession } from "~/memberSession.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (token) {
    const member = await getMemberByToken(token);
    if (member) {
      throw await createMemberSession({
        request,
        memberId: member.id,
        remember: true,
        redirectTo: "/member",
      });
    }
  }

  return { error: "Member token does not exist" };
}

export default function memberLogin() {
  const data = useLoaderData<typeof loader>();
  return <div>{data.error}</div>;
}
