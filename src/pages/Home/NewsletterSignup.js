import React, { useState } from 'react';
import './NewsletterSignup.css';

const FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdtb-oXFb2l1jGlSejpJa5cua9VssCkh_s5Ef1vCpYwbdiiXw/formResponse';
const EMAIL_ENTRY_ID = 'entry.955308745';
const SUBSCRIBED_KEY = 'newsletter-subscribed';
// single flag to disable all localStorage-backed caching for local testing, set in .env.local
const USE_CACHE = process.env.REACT_APP_DISABLE_CACHE !== 'true';

// compact: true renders a smaller inline variant for use inside the hero copy column
function NewsletterSignup({ compact }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(
    () => USE_CACHE && localStorage.getItem(SUBSCRIBED_KEY) === 'true',
  );
  const [justSubscribed, setJustSubscribed] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append(EMAIL_ENTRY_ID, email);

    fetch(FORM_ACTION_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
    });

    if (USE_CACHE) {
      localStorage.setItem(SUBSCRIBED_KEY, 'true');
    }
    setSubscribed(true);
    setJustSubscribed(true);
  }

  if (subscribed && !justSubscribed) {
    return null;
  }

  return (
    <section className={`newsletter${compact ? ' newsletter-compact' : ''}`}>
      {justSubscribed ? (
        <p className="newsletter-thanks">Done, you are in! Welcome to the gang.</p>
      ) : (
        <>
          {compact ? (
            <p className="newsletter-copy">
              Subscribe to my newsletter. Boring emails? Not from here, promise.
            </p>
          ) : (
            <>
              <div className="newsletter-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <h2 className="newsletter-heading">Converge on our newsletter</h2>
              <p className="newsletter-copy">
                One email a week, that's all. No local minima, only new lessons.
              </p>
            </>
          )}
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </>
      )}
    </section>
  );
}

export default NewsletterSignup;
