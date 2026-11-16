import type { MetaFunction } from "react-router";

import { LegalPage, LegalSection, TextLink } from "../components/LegalPage";
import { EMAIL } from "../data/contact";
import { pageMeta } from "../seo";

// The policy that Google Play and the App Store link to. Its text comes
// from store/privacy-policy.html in the do nothing repository, which is
// written to be public. Change both together.
const UPDATED = "15 November 2026";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "do nothing privacy policy | Kamil Pułka",
    description:
      "The do nothing app does not collect, send or sell any personal data.",
    path: "/projects/do-nothing/privacy",
    image: "/og/do-nothing.jpg",
    imageAlt: "The do nothing cover",
  });

export default function DoNothingPrivacy() {
  return (
    <LegalPage
      title="Privacy"
      updated={UPDATED}
      back={{ to: "/projects/do-nothing", label: "do nothing" }}
      lead="do nothing is a mobile app made by Kamil Pułka. This policy explains what the app does with your information. The short answer is that the app does not collect, send or sell any personal data."
    >
      <LegalSection title="Data the app stores">
        <p>The app stores the following on your device only:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>whether you closed the first-launch explanation</li>
          <li>whether the app asked for notification permission</li>
          <li>your session totals: today, total, best and last session</li>
          <li>
            the state of a session in progress, so that the app can keep its
            time if the system closes the app
          </li>
        </ul>
        <p>
          This data never leaves your device. There is no account, no server, no
          cloud sync, and no backup service run by me. If you delete the app or
          clear its data, this data is deleted.
        </p>
      </LegalSection>

      <LegalSection title="Sensors">
        <p>
          During a session, the app reads the motion sensors (accelerometer and
          gyroscope) to decide whether the phone is still. On Android this
          continues in the background until the session stops. On iPhone, with
          your permission, the app reads the Motion & Fitness activity history
          of the session, for example stationary or walking, after you return to
          the app. The readings are processed on the device and are not stored
          or sent anywhere.
        </p>
      </LegalSection>

      <LegalSection title="Notifications and Live Activities">
        <p>
          On Android, a session shows a silent notification with the session
          time, and the phone vibrates to remind you if you use it during a
          session. On iPhone, a session can show a Live Activity on the Lock
          Screen, and one notification reminds you if you leave a session for
          another app. All of this is created on your device. No push service is
          used.
        </p>
      </LegalSection>

      <LegalSection title="Data I do not collect">
        <p>
          The app does not collect your name, email, contacts, location, photos,
          identifiers, usage analytics, crash reports or advertising data. The
          app contains no ads and no third-party analytics or tracking code.
        </p>
      </LegalSection>

      <LegalSection title="Links">
        <p>
          On Android, the info page contains a "buy me a coffee" link. If you
          tap it, your browser opens an external website. That website
          (ko-fi.com) has its own privacy policy. The app sends no data to it.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The app is not directed at children under 13 and does not knowingly
          collect data from anyone.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If this policy changes, I will update this page and the date above.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy:{" "}
          <TextLink href={`mailto:${EMAIL}`}>{EMAIL}</TextLink>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
