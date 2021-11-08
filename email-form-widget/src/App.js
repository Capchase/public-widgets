import React from "react";

const NOT_ALLOWED_DOMAINS = [
  "gmail",
  "aol",
  "pipe",
  "yahoo",
  "ymail",
  "icloud",
  "me",
  "msn",
  "novelgp",
  "mac",
  "outlook",
  "hotmail",
  "protonmail",
  "fastmail",
  "icloud",
  "live",
  "email",
  "mail",
];

const BANNED_DOMAINS = [
  "babbien.com",
  "100xbit.com",
  "cfcjy.com",
  "email.com",
  "697av.com",
];

const BANNED_ADDRESSES = ["lirog60434@ampswipe.com"];

const NOT_ALLOWED_EMAILS = [...BANNED_DOMAINS, ...BANNED_ADDRESSES];

const hasValidEmailFormat = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email && re.test(email.toLowerCase());
};
const splitEmail = (email) => {
  const emailSplit = email.split("@");
  return emailSplit[emailSplit.length - 1].toLowerCase();
};

const isEducationalEmail = (email) => {
  const emailDomain = splitEmail(email);
  const institutionalDomainPattern = /\.edu($|\.)/i;
  return institutionalDomainPattern.test(emailDomain);
};

const isBannedEmail = (email, banlist) => {
  const emailDomain = splitEmail(email);
  const userHasBannedEmail = banlist.some((item) => {
    return emailDomain === item || email === item;
  });
  return userHasBannedEmail;
};

const isBannedDomain = (email, banlist) => {
  const emailDomain = splitEmail(email).split(".")[0];
  return banlist.some((item) => {
    return emailDomain === item.toLowerCase();
  });
};

const isValidEmail = (email) => {
  return (
    hasValidEmailFormat(email) &&
    !isBannedEmail(email, [...NOT_ALLOWED_EMAILS, ...BANNED_ADDRESSES]) &&
    !isBannedDomain(email, NOT_ALLOWED_DOMAINS) &&
    !isEducationalEmail(email)
  );
};

const identifyInHubspot = (email) => {
  if (window?.analytics && email) {
    // Need both identify + page for Hubspot
    window.analytics.identify({
      email,
      // IMPORTANT: To append values to multiple checkbox field (like 'website_touchpoint_s_') it
      // is NECESSARY to add a semicolon (';') at the beginning of the string and in between elements
      website_touchpoint_s_: ";Sign Up CTA;",
    });
    window.analytics.page();
  }
};

const App = ({ location }) => {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  const submitEmail = () => {
    // Check email is correct before redirecting
    if (email && !isValidEmail(email))
      return setError("Introduce a valid work email");

    // Clear error
    setError("");
    window.open(
      `https://app.capchase.com/register${email ? `?email=${email}` : ""}`,
      "_blank"
    );
    if (window.analytics) {
      identifyInHubspot(email);
      window.analytics.track("Sign-up Button Clicked", {
        location,
      });
    }
  };

  const onBlur = () => {
    if (email && !isValidEmail(email))
      return setError("Introduce a valid work email");

    // Clear error if email is valid
    setError("");
    if (!window.analytics) return;

    identifyInHubspot(email);
    window.analytics.track("Email Field Edited", {
      email,
      location,
    });
  };

  return (
    <div className="submit-email-widget-form">
      <input
        type="text"
        value={email}
        className={`submit-email-widget-input${error ? " email-error" : ""}`}
        placeholder="Enter your email"
        onBlur={onBlur}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={submitEmail} className="submit-email-widget-button">
        Sign Up
      </button>
      {error && (
        <p class="submit-email-widget-error-msg">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.77994 1.1692C5.31517 0.217689 6.68513 0.217688 7.22035 1.1692L11.1266 8.11358C11.6515 9.04682 10.9771 10.1999 9.90636 10.1999H2.09393C1.02318 10.1999 0.348776 9.04683 0.873727 8.11358L4.77994 1.1692ZM6.70009 8.10002C6.70009 8.48662 6.38668 8.80002 6.00009 8.80002C5.61349 8.80002 5.30009 8.48662 5.30009 8.10002C5.30009 7.71342 5.61349 7.40002 6.00009 7.40002C6.38668 7.40002 6.70009 7.71342 6.70009 8.10002ZM6.00009 2.50002C5.61349 2.50002 5.30009 2.81343 5.30009 3.20002V5.30002C5.30009 5.68662 5.61349 6.00002 6.00009 6.00002C6.38668 6.00002 6.70009 5.68662 6.70009 5.30002V3.20002C6.70009 2.81343 6.38668 2.50002 6.00009 2.50002Z"
              fill="#F87171"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default App;
