import { prisma } from "~/db.server";
import type { Member } from "@prisma/client";

export type { Member } from "@prisma/client";

export function getMemberByPhoneNumber(phoneNumber: string) {
  return prisma.member.findFirst({
    where: { phoneNumber },
  });
}

export async function getLatestInvitation(memberId: Member["id"]) {
  return prisma.invitation.findFirst({
    where: {memberId},
    orderBy: { createdAt: "desc" },
  });
}

export async function getUpcomingInvitations(memberId: Member["id"]){
  return prisma.invitation.findMany({
    where: {
      AND:[
        {memberId},
        {event:{
          dateTime: {
            gt: new Date(),
          }
        }}
      ]
    },
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

export async function getAllActiveMembers() {
  return prisma.member.findMany();
}

export async function getMemberById(id: Member["id"]){
  return prisma.member.findUnique({where: {id}})
}

export async function getMemberByToken(token: string) {
  return prisma.member.findFirst({
    where: { token },
  });
}

