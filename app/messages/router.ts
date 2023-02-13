import { recordResponse } from '~/models/invitation.server'
import { getLatestInvitation, getMemberByPhoneNumber } from '~/models/member.server'

export async function handleMessage(fromNumber: string, message: string) {
    const member = await getMemberByPhoneNumber(fromNumber)

    if(!member) {
        return {
            response: "Please contact a manager of this group to register."
        }
    }

    const latestInvite = await getLatestInvitation(member.id)

    if(latestInvite) {
        switch(message) {
            case 'YES': {
                await recordResponse({ invitationId: latestInvite.id, response: 'RESPONDED_YES' })
                return {
                    response: 'We look forward to seeing you!'
                }
            }
            case 'NO': {
                await recordResponse({ invitationId: latestInvite.id, response: 'RESPONDED_NO' })
                return {
                    response: "Shucks, we'll catch you next time."
                }
            }
            case 'MAYBE': {
                await recordResponse({ invitationId: latestInvite.id, response: 'RESPONDED_NO' })
                return {
                    response: "We'll follow up with you in a few days."
                }
            }
            default: {
                return {
                    response: 'Please respond with YES, NO, or MAYBE'
                }
            }
        }
    } else {
        return {
            response: 'Not sure what you are asking for...'
        }
    }
}
