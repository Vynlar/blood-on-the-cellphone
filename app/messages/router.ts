import { recordGuests, recordResponse } from "~/models/invitation.server";
import {
  getLatestInvitation,
  getMemberByPhoneNumber,
} from "~/models/member.server";
import {
  getRequestByPhoneNumber,
  upsertMembershipRequest,
} from "~/models/membership_request.server";

export async function handleMessage(fromNumber: string, message: string) {
  const member = await getMemberByPhoneNumber(fromNumber);

  if (!member) {
    const membershipRequest = await getRequestByPhoneNumber(fromNumber);
    if (!membershipRequest) {
      // Brand new person

      await upsertMembershipRequest(fromNumber);
      return {
        response: "Welcome! Respond with your name to request membership.",
      };
    }

    const name = message.trim();
    await upsertMembershipRequest(fromNumber, name);
    return {
      response: `Hello, ${name}. A request has been sent and you will be notified when it is approved. If you want to change your name, simply sent another message and we will update it.`,
    };
  }

  switch (message.trim().toLowerCase()) {
    case "help":
      return {
        response:
          "Respond with any of the following commands: HELP, INVITATIONS",
      };

    case "invitations":
      return {
        response:
          "To view or update invitations and RSVPs, use this link: " +
          process.env.HOST_NAME +
          "/memberLogin?token=" +
          member.token,
      };
  }

  const latestInvite = await getLatestInvitation(member.id);

  if (latestInvite) {
    if (latestInvite.status === "SENT") {
      switch (message.trim().toUpperCase()) {
        case "YES": {
          await recordResponse({
            invitationId: latestInvite.id,
            response: "RESPONDED_YES",
          });
          return {
            response:
              "We look forward to seeing you! If you are bringing guests, please respond with the number of guests you plan to bring (excluding yourself).",
          };
        }
        case "NO": {
          await recordResponse({
            invitationId: latestInvite.id,
            response: "RESPONDED_NO",
          });
          return {
            response: "Shucks, we'll catch you next time.",
          };
        }
        case "MAYBE": {
          await recordResponse({
            invitationId: latestInvite.id,
            response: "RESPONDED_MAYBE",
          });
          return {
            response: "We'll follow up with you in a few days.",
          };
        }
        default: {
          return {
            response: "Please respond with YES, NO, or MAYBE",
          };
        }
      }
    } else if (latestInvite.status === "RESPONDED_YES") {
      const numGuests: number = parseInt(message);
      if (isNaN(numGuests)) {
        return {
          response: "Please type a number between 1-10",
        };
      }

      if (numGuests < 0) {
        return {
          response: "You can't bring negative guests, silly!",
        };
      } else if (numGuests > 10) {
        return {
          response:
            "Wow you have a lot of friends. Please type a number from 1-10.",
        };
      } else {
        await recordGuests({ invitationId: latestInvite.id, numGuests });
        return {
          response: "Thanks for letting us know about your guests.",
        };
      }
    }
  }
  return {
    response: "Not sure what you are asking for...",
  };
}
