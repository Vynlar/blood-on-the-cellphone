import { useLoaderData } from "@remix-run/react";
import { getUpcomingEvents } from "~/models/event.server";
import parseISO from "date-fns/parseISO";
import intlFormat from "date-fns/intlFormat";
import logo from "../botc_logo.png";

export async function loader() {
  const upcomingEvents = await getUpcomingEvents();

  return { upcomingEvents };
}

export default function Index() {
  const { upcomingEvents } = useLoaderData<typeof loader>();

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-t from-red-900 to-black">
      <div className="mx-auto mt-0 max-w-screen-sm space-y-12 py-10 px-4 text-white">
        <header className="flex flex-col items-center">
          <img alt="Blood on the Clocktower logo" src={logo} />
          <span>in Fargo, ND</span>

          <p>
            We are a group who play{" "}
            <a href="https://bloodontheclocktower.com/" className="underline">
              Blood on the Clocktower
            </a>{" "}
            in Fargo, North Dakota.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="sr-only">What is Blood on the Clocktower?</h2>
          <p className="font-bold italic">
            What is it, you ask? We think the game&lsquo;s creators put it best:
          </p>
          <figure>
            <blockquote
              className="space-y-4 border-l-4 border-white pl-4"
              cite="https://bloodontheclocktower.com/"
            >
              <p>
                Blood on the Clocktower is a bluffing game enjoyed by 5 to 20
                players on opposing teams of Good and Evil, overseen by a
                Storyteller player who conducts the action and makes crucial
                decisions.
              </p>
              <p>
                During a &lsquo;day&lsquo; phase players socialize openly and
                whisper privately to trade knowledge or spread lies, culminating
                in a player&lsquo;s execution if a majority suspects them of
                being Evil.
              </p>
              <p>
                Of a &lsquo;night&lsquo; time, players close their eyes and are
                woken one at a time by the Storyteller to gather information,
                spread mischief, or kill. Use all your powers of deduction and
                deception to survive this game of murder and mystery.
              </p>
              <p>
                The Storyteller uses the game&lsquo;s intricate playing pieces
                to guide each game, leaving others free to play without a table
                or board. Players stay in the thick of the action to the very
                end even if their characters are killed, haunting Ravenswood
                Bluff as ghosts trying to win from beyond the grave.
              </p>
              <p>
                The tension and excitement builds for everyone as the bodies of
                victims pile ever higher...
              </p>
            </blockquote>
          </figure>
        </section>

        <section className="space-y-6">
          <h2 className="text-center text-2xl font-bold">Upcoming events</h2>
          <ul>
            {upcomingEvents.map((event) => (
              <li className="flex flex-col space-y-2 rounded-xl border-4 border-red-500 bg-black/50 p-4">
                <strong>{event.schedule.title}</strong>
                <span>
                  {intlFormat(parseISO(event.dateTime), {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </span>
                <span>{event.responses.yes} people are coming</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
