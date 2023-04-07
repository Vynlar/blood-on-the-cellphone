import { prisma } from "~/db.server";
import type { Member, Event, Invitation } from "@prisma/client";

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

export async function getInvitation(id: Invitation["id"] ){
  return prisma.invitation.findUnique({
    where: {id},
    include: {
      event: {
        include: {
          schedule: {
            select: {
              title: true
            }
          }
        }
      }
    }
  })
}

export async function updateInvitation(id: Invitation["id"], status: string, guests: number ){
  return prisma.invitation.update({
    where: {id},
    data: {
      status: status,
      guests: guests
    }
  })
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

export async function sendInvite({
  eventId,
  memberId,
}: {
  eventId: Event["id"];
  memberId: Member["id"];
}) {
  return prisma.invitation.create({
    data: {
      status: "SENT",
      eventId,
      memberId,
    },
  });
}
