import { prisma } from "~/db.server";
import { Prisma } from "@prisma/client";
import type { Schedule } from "@prisma/client";
import { getAllActiveMembers } from "./member.server";

// 1: Define a type that includes the relation to `Post`
const eventWithInvitations = Prisma.validator<Prisma.EventArgs>()({
  include: { invitations: true },
});

// 3: This type will include a user and all their posts
//type UserWithPosts = Prisma.UserGetPayload<typeof userWithPosts>

type EventWithInvitations = Prisma.EventGetPayload<typeof eventWithInvitations>;

export type WithResponses<T> = T & {
  responses: {
    yes: number;
    no: number;
    maybe: number;
    noAnswer: number;
  };
};

interface CreateNewEventArgs {
  date: Date;
  scheduleId: Schedule["id"];
}

function computeResponses<T extends EventWithInvitations>(
  event: T
): WithResponses<T> {
  return {
    ...event,
    responses: {
      yes: event.invitations
        .filter((invitation) => invitation.status === "RESPONDED_YES")
        .reduce((total, invite) => total + (invite.guests ?? 0) + 1, 0),
      no: event.invitations.filter(
        (invitation) => invitation.status === "RESPONDED_NO"
      ).length,
      maybe: event.invitations.filter(
        (invitation) => invitation.status === "RESPONDED_MAYBE"
      ).length,
      noAnswer: event.invitations.filter(
        (invitation) => invitation.status === "SENT"
      ).length,
    },
  };
}

export async function getEvent({ eventId }: { eventId: Event["id"] }) {
  const data = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      schedule: true,
      invitations: { include: { member: true } },
    },
  });

  if (data) return computeResponses(data);
  return data;
}

export async function getUninvitedMembers({
  eventId,
}: {
  eventId: Event["id"];
}) {
  return prisma.member.findMany({
    where: { invitations: { none: { eventId } }, isActive: true },
  });
}

export async function createNewEvent({ date, scheduleId }: CreateNewEventArgs) {
  const event = await prisma.event.create({
    data: {
      dateTime: date,
      scheduleId,
    },
  });

  return event;
}

export async function getUpcomingEvents() {
  const events = await prisma.event.findMany({
    where: {
      dateTime: { gt: new Date() },
    },
    include: {
      schedule: true,
      invitations: true,
    },
  });

  return events.map(computeResponses);
}

export async function sendInvitations({ eventId }: { eventId: Event["id"] }) {
  console.log("Sending invites for event ", eventId);

  const uninvitedMembers = await getUninvitedMembers({ eventId });

  const results = await Promise.allSettled(
    uninvitedMembers.map(async (member) => {
      console.debug(`Processing ${member.id}`);
      const hasExistingInvite = await prisma.invitation.findFirst({
        where: { eventId, memberId: member.id },
      });

      if (hasExistingInvite) {
        console.log(
          `Invite already exists for ${member.phoneNumber} (${member.id}), skipping invite creation.`
        );
        return;
      }

      console.debug(`Creating invite for ${member.phoneNumber} (${member.id})`);
      return prisma.invitation.create({
        data: {
          status: "SENT",
          eventId,
          memberId: member.id,
        },
      });

      // send a text
      // If there's an issue with sending, delete the invite
    })
  );

  const failures = results.flatMap((result) => {
    if (result.status === "rejected") {
      return [result.reason];
    }
    return [];
  });

  return failures;
}
