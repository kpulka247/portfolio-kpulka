import { Link, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Privacy | Kamil Pułka" },
  {
    name: "description",
    content: "What kpulka.com stores, who hosts it, and your rights.",
  },
];
import { FaArrowLeft } from "react-icons/fa";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { fadeIn } from "../utils/animations";

const PrivacyPolicy = () => {
  return (
    <motion.div
      className="bg-black text-zinc-300 min-h-screen flex flex-col"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <main
        id="main"
        className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors mb-8 group"
        >
          <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="prose prose-invert prose-headings:text-zinc-200 prose-strong:text-zinc-200 prose-code:text-zinc-200 max-w-none">
          <h1>Privacy Policy</h1>
          <p>
            <strong>Effective Date:</strong> November 15, 2026
          </p>
          <p>
            This Privacy Policy explains how Kamil Pułka ("I", "me", "my")
            handles information from users ("you", "your") of the website
            kpulka.com (the "Website") and related software products.
          </p>

          <h2>1. Who is responsible for your data?</h2>
          <p>
            I, Kamil Pułka, am the controller of your personal data. If you have
            any questions about this policy or your data, you can contact me at:{" "}
            <strong>contact@kpulka.com</strong>.
          </p>

          <h2>2. Data Collection on the Website (kpulka.com)</h2>
          <p>
            The Website does not use analytics, cookies, or local storage, and
            it does not track your visits.
          </p>

          <h3>a) Hosting</h3>
          <p>
            The Website is hosted on GitHub Pages. GitHub receives your IP
            address when your browser loads the Website, as every web host does,
            and keeps it in its server logs for security.
          </p>

          <h3>b) Contact Links</h3>
          <p>
            The Website links to my GitHub and LinkedIn profiles and to my email
            address (<code>mailto:</code>). When you use them, you interact
            directly with those services, which have their own privacy policies.
            This Website{" "}
            <strong>
              does not collect, store, or have access to any personal data
            </strong>{" "}
            that you share with them.
          </p>

          <h2>3. Dark Connect Browser Extension</h2>
          <p>
            I am also the developer of the "Dark Connect" browser extension,
            available via the Chrome Web Store and other platforms. I am
            committed to transparency regarding this software.
          </p>
          <h3>a) No Data Collection</h3>
          <p>
            The Dark Connect extension is designed with privacy as a core
            principle. It{" "}
            <strong>
              does not collect, store, transmit, or sell any user data
            </strong>
            .
          </p>
          <ul>
            <li>
              It functions locally on your device to modify the visual
              appearance (CSS) of the Garmin Connect website.
            </li>
            <li>
              It does not track your browsing activity, health data, login
              credentials, or any other personal information.
            </li>
            <li>
              No analytics scripts or third-party trackers are embedded within
              the extension's code.
            </li>
          </ul>

          <h3>b) Chrome Web Store Analytics</h3>
          <p>
            Please note that the platform where you download the extension
            (e.g., Chrome Web Store) may collect its own aggregated statistics
            regarding store listing visits and installation counts. This data is
            governed by the privacy policy of the respective store platform
            (e.g., Google) and is not collected by the Dark Connect extension
            software itself.
          </p>

          <h2>4. Who has access to your data?</h2>
          <p>
            GitHub, Inc. hosts the Website and processes the server logs
            described in Section 2a under its own privacy statement. If you
            email me, I keep your message only as long as the conversation needs
            and never share it.
          </p>

          <h2>5. Your Privacy Rights</h2>
          <p>You have rights over your data under GDPR, including:</p>
          <ul>
            <li>
              The right to <strong>access</strong>, <strong>correct</strong>, or{" "}
              <strong>delete</strong> your information.
            </li>
            <li>
              The right to <strong>object to</strong> or{" "}
              <strong>restrict</strong> processing.
            </li>
            <li>
              The right to <strong>lodge a complaint</strong> with a supervisory
              authority (like Poland's UODO).
            </li>
          </ul>
          <p>
            To exercise these rights, please contact me at the email address in
            Section 1.
          </p>

          <h2>6. Updates to this Policy</h2>
          <p>
            I reserve the right to make changes to this Privacy Policy at any
            time. Any changes will be posted on this page.
          </p>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default PrivacyPolicy;
