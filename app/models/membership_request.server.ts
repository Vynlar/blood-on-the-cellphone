import { prisma } from "~/db.server";
import type { MembershipRequest } from "@prisma/client";
import invariant from "tiny-invariant";

export type { MembershipRequest } from "@prisma/client";

export async function getMembershipRequest({ id }: { id: MembershipRequest['id'] }) {
    return prisma.membershipRequest.findFirst({
        where: { id }
    })
}

export async function approveMembershipRequest(request: MembershipRequest) {
    invariant(request.name, 'Only requests with names can be approved')
    const [member] = await prisma.$transaction([
        prisma.member.create({
            data: { phoneNumber: request.phoneNumber, name: request.name }
        }),
        prisma.membershipRequest.delete({
            where: { id: request.id }
        })
    ])

    return member
}

export function getRequestByPhoneNumber(phoneNumber: string) {
    return prisma.membershipRequest.findFirst({
        where: { phoneNumber }
    })
}

export function getAllMembershipRequests() {
    return prisma.membershipRequest.findMany({})
}

export function upsertMembershipRequest(phoneNumber: string, name?: string) {
    return prisma.membershipRequest.upsert({
        where: { phoneNumber },
        create: {
            phoneNumber
        },
        update: {
            phoneNumber,
            name,
        },
    })
}
