import { prisma } from "~/db.server";
import type { Event, Schedule } from "@prisma/client";
import { getAllActiveMembers } from "./member.server";

export type { Event } from "@prisma/client";

interface CreateNewEventArgs {
  date: Date;
  scheduleId: Schedule["id"];
}

export async function getEvent({ eventId }: { eventId: Event['id'] }) {
  return prisma.event.findUnique({
    where: { id: eventId }, include: {
      schedule: true, invitations: { include: { member: true } }
    }
  })
}

export async function getUninvitedMembers({ eventId }: { eventId: Event['id'] }) {
  return prisma.member.findMany({
    where: { invitations: { none: { eventId } }, isActive: true }
  })
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
  return prisma.event.findMany({
    where: {
      dateTime: { gt: new Date() },
    },
    include: {
      schedule: true,
      invitations: true,
    },
  });
}

export async function sendInvitations({ eventId }: { eventId: Event['id'] }) {
  console.log('Sending invites for event ', eventId)

  const uninvitedMembers = await getUninvitedMembers({ eventId })

  const results = await Promise.allSettled(uninvitedMembers.map(async member => {
    console.debug(`Processing ${member.id}`)
    const hasExistingInvite = await prisma.invitation.findFirst({
      where: { eventId, memberId: member.id }
    })

    if (hasExistingInvite) {
      console.log(`Invite already exists for ${member.phoneNumber} (${member.id}), skipping invite creation.`)
      return
    }

    console.debug(`Creating invite for ${member.phoneNumber} (${member.id})`)
    return prisma.invitation.create({
      data: {
        status: 'SENT',
        eventId,
        memberId: member.id,
      },
    })

    // send a text
    // If there's an issue with sending, delete the invite
  }))

  const failures = results.flatMap((result) => {
    if (result.status === 'rejected') {
      return [result.reason]
    }
    return []
  })

  return failures
}
