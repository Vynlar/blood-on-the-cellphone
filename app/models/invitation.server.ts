import { prisma } from "~/db.server";
import type { Invitation } from "@prisma/client";

export type { Invitation } from "@prisma/client";

export async function getAllInvitations() {
  return prisma.invitation.findMany({
    include: {
      member: { select: { id: true, name: true } },
      event: {
        include: {
          schedule: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function recordResponse({
  invitationId,
  response,
}: {
  invitationId: Invitation["id"];
  response: string;
}) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: response,
    },
  });
}

export async function recordGuests({
  invitationId,
  numGuests,
}: {
  invitationId: Invitation["id"];
  numGuests: number;
}) {
  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      guests: numGuests,
    },
  });
}


