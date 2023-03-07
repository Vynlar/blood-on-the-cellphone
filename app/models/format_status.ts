export function formatStatus(status: string): string {
    switch (status) {
        case "SENT":
            return "hasn't responded";
        case "RESPONDED_YES":
            return "is coming";
        case "RESPONDED_NO":
            return "is not coming";
        case "RESPONDED_MAYBE":
            return "may be coming";
    }
    return "";
}
