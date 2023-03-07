import { formatStatus } from "~/models/format_status";
import parseISO from "date-fns/parseISO";
import format from "date-fns/format";
import { Invitation, Member, Schedule, Event } from "@prisma/client";

interface InvitationListItemProps {
    memberName: Member['name']
    scheduleTitle: Schedule['title']
    dateTime: string
    status: Invitation['status']
    guestCount: Invitation['guests']
}

export const InvitationListItem = ({ memberName, scheduleTitle, dateTime, status, guestCount }: InvitationListItemProps) => {
    return <li
        className="rounded border border-gray-200 p-4 shadow"
    >
        <strong>{memberName}</strong> is invited to{" "}
        <strong>{scheduleTitle}</strong> at{" "}
        <strong>
            {format(
                parseISO(dateTime),
                "h:mm b 'on' MMM dd"
            )}
        </strong>{" "}
        and {formatStatus(status)}
        {guestCount ? (
            <> with <strong>{guestCount} guests</strong></>
        ) : null}
    </li>
}
