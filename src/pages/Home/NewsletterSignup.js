import React, { useState } from 'react';
import './NewsletterSignup.css';

const FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdtb-oXFb2l1jGlSejpJa5cua9VssCkh_s5Ef1vCpYwbdiiXw/formResponse';
const EMAIL_ENTRY_ID = 'entry.955308745';
const SUBSCRIBED_KEY = 'newsletter-subscribed';

function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(
    () => localStorage.getItem(SUBSCRIBED_KEY) === 'true'
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

    localStorage.setItem(SUBSCRIBED_KEY, 'true');
    setSubscribed(true);
    setJustSubscribed(true);
  }

  if (subscribed && !justSubscribed) {
    return null;
  }

  return (
    <section className="newsletter">
      {justSubscribed ? (
        <p className="newsletter-thanks">You're in! Thanks for subscribing.</p>
      ) : (
        <>
          <h2 className="newsletter-heading">Get new lessons in your inbox</h2>
          <p className="newsletter-copy">No spam, just new interactive lessons as they drop.</p>
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
