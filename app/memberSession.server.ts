import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import type { Member } from "~/models/member.server";
import { getMemberById } from "~/models/member.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__member_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const MEMBER_SESSION_KEY = "memberId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getMemberId(
  request: Request
): Promise<Member["id"] | undefined> {
  const session = await getSession(request);
  const memberId = session.get(MEMBER_SESSION_KEY);
  return memberId;
}

export async function getMember(request: Request) {
  const memberId = await getMemberId(request);
  if (memberId === undefined) return null;

  const member = await getMemberById(memberId);
  if (member) return member;

  throw await logout(request);
}

export async function requireMemberId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const memberId = await getMemberId(request);
  if (!memberId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/`);
  }
  return memberId;
}

export async function requireMember(request: Request) {
  const memberId = await requireMemberId(request);

  const member = await getMemberById(memberId);
  if (member) return member;

  throw await logout(request);
}

export async function createMemberSession({
  request,
  memberId,
  remember,
  redirectTo,
}: {
  request: Request;
  memberId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(MEMBER_SESSION_KEY, memberId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
