import { NOTIFICATION_TYPE } from "@/lib/constants/social.constants";

const seatLabel = (count) => `${count} seat${count === 1 ? "" : "s"}`;

/**
 * Title/body/link for each notification type. `restaurant` and `actor`
 * are display names; `seats` / `fromSeats` only where relevant. Kept in
 * one place so wording is consistent wherever an action notifies.
 */
export function buildNotificationContent(
  type,
  { actor, restaurant, seats, fromSeats, hostName },
) {
  const at = restaurant ? ` at ${restaurant}` : "";
  const hosts = hostName ? `${hostName}'s table` : "the table";

  switch (type) {
    case NOTIFICATION_TYPE.REQUEST_SENT:
      return {
        title: "Request sent",
        body: `You asked to join ${hosts}${at} (${seatLabel(seats)}). We'll let you know when the host responds.`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.JOINED_TABLE:
      return {
        title: "You're in!",
        body: `You joined ${hosts}${at} (${seatLabel(seats)}).`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.JOIN_REQUEST:
      return {
        title: "New join request",
        body: `${actor} asked to join your table${at} (${seatLabel(seats)}).`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.REQUEST_ACCEPTED:
      return {
        title: "You're in!",
        body: `${actor} accepted your request to join their table${at}.`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.REQUEST_REJECTED:
      return {
        title: "Request declined",
        body: `${actor} declined your request to join their table${at}.`,
        link: "/community-dining",
      };
    case NOTIFICATION_TYPE.REQUEST_CANCELLED:
      return {
        title: "Request withdrawn",
        body: `${actor} withdrew their request to join your table${at}.`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.SEAT_CHANGE_REQUEST:
      return {
        title: "Seat change request",
        body: `${actor} wants to change from ${seatLabel(fromSeats)} to ${seatLabel(seats)}${at}.`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.SEAT_CHANGE_ACCEPTED:
      return {
        title: "Seat change approved",
        body: `${actor} approved your change to ${seatLabel(seats)}${at}.`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.SEAT_CHANGE_REJECTED:
      return {
        title: "Seat change declined",
        body: `${actor} declined your change to ${seatLabel(seats)}${at}.`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.GUEST_JOINED:
      return {
        title: "New guest",
        body: `${actor} joined your table${at} (${seatLabel(seats)}).`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.GUEST_LEFT:
      return {
        title: "A guest left",
        body: `${actor} left your table${at}.`,
        link: "/dining-journey",
      };
    case NOTIFICATION_TYPE.REMOVED_FROM_TABLE:
      return {
        title: "Removed from a table",
        body: `The host removed you from their table${at}.`,
        link: "/community-dining",
      };
    case NOTIFICATION_TYPE.TABLE_CANCELLED:
      return {
        title: "Table cancelled",
        body: `${actor} cancelled their table${at}.`,
        link: "/dining-journey",
      };
    default:
      return { title: "Update", body: "", link: "/dining-journey" };
  }
}
