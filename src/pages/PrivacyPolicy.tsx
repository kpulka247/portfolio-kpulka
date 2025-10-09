import { Link } from "react-router-dom";
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
      <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
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
            <strong>Effective Date:</strong> October 09, 2025
          </p>
          <p>
            This Privacy Policy explains how Kamil Pułka ("I", "me", "my")
            handles information from users ("you", "your") of the website
            kpulka.com (the "Website").
          </p>

          <h2>1. Who is responsible for your data?</h2>
          <p>
            I, Kamil Pułka, am the controller of your personal data. If you have
            any questions about this policy or your data, you can contact me at:{" "}
            <strong>contact@kpulka.com</strong>.
          </p>

          <h2>2. What information do I collect and why?</h2>
          <p>
            My goal is to collect minimal data, focusing on what's necessary to
            improve the Website and allow you to get in touch.
          </p>

          <h3>a) Website Analytics & Event Tracking (Google Analytics 4)</h3>
          <p>
            I use Google Analytics 4 to understand how visitors interact with
            the Website. To protect your privacy, I use Google Consent Mode:
          </p>
          <ul>
            <li>
              <strong>If you decline consent:</strong> I receive only
              aggregated, anonymous "pings" (e.g., that a page was viewed). No
              cookies are used, and you cannot be personally identified.
            </li>
            <li>
              <strong>If you accept consent:</strong> Cookies are used to gather
              more detailed data. This data is pseudonymized, meaning it is tied
              to a random client identifier, not your personal identity (like
              name or email). It allows me to understand user journeys across
              multiple visits. Your IP address is always anonymized by Google
              Analytics.
            </li>
          </ul>
          <p>
            I also collect interaction data to understand which content is most
            engaging. This includes tracking clicks on:
          </p>
          <ul>
            <li>
              <strong>Project Cards:</strong> To see which projects generate the
              most interest.
            </li>
            <li>
              <strong>Contact Icons:</strong> To know which contact methods
              (GitHub, LinkedIn, Email) are most frequently used.
            </li>
          </ul>
          <p>
            This tracking is event-based (e.g., "a click occurred on the GitHub
            icon").
            <strong>If you decline consent</strong>, this event is sent
            completely anonymously. <strong>If you grant consent</strong>, the
            event is associated with your pseudonymous identifier to help me
            analyze user behavior patterns. In either case, it is not tied to
            your real-world identity.
          </p>
          <p>
            The legal basis for this processing is my legitimate interest (Art.
            6(1)(f) GDPR) to improve the Website, and your consent (Art. 6(1)(a)
            GDPR) where you provide it.
          </p>

          <h3>b) Information from Contact Links</h3>
          <p>
            The Website provides links to my social profiles (GitHub, LinkedIn)
            and a direct email (<code>mailto:</code>) link. When you use them,
            you interact directly with third-party services, which have their
            own privacy policies. This Website{" "}
            <strong>does not collect or store any data</strong> from these
            actions.
          </p>

          <h3>c) Remembering Your Choices (Local Storage)</h3>
          <p>
            The Website uses your browser's <code>localStorage</code> to save
            your consent choice (<code>cookie_consent</code>). This is a purely
            functional step to avoid showing you the consent banner on every
            visit.
          </p>

          <h2>3. Who has access to your data?</h2>
          <p>
            Your analytics data is processed by Google Ireland Limited. This
            data may be transferred to servers in the United States. Google uses
            Standard Contractual Clauses to ensure your data is protected.
          </p>

          <h2>4. Your Privacy Rights</h2>
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
              The right to <strong>withdraw consent</strong> at any time.
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

          <h2>5. Updates to this Policy</h2>
          <p>
            I reserve the right to make changes to this Privacy Policy at any
            time. Any changes will be posted on this page.
          </p>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
};

export default PrivacyPolicy;
