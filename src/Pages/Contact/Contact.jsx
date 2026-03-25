import { useState } from 'react';
import './Contact.css';

const CONTACT_LINKS = [
  {
    label: 'Email',
    href: 'mailto:me@dykdee.xyz',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/dykdee',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6" cy="7" r="1.5" />
        <path d="M5 10v8" />
        <path d="M10 18v-5a3 3 0 0 1 6 0v5" />
        <path d="M10 13v5" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/dykdee',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 7L4 12l4 5" />
        <path d="M16 7l4 5-4 5" />
        <path d="M10 19l4-14" />
      </svg>
    ),
  },
  {
    label: 'Telegram',
    href: 'https://t.me/dyk_dee',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 4L10 13" />
        <path d="M21 4L14 20l-4-7-7-2z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/7080551309',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 20l-2.5 1.8.9-3.1" />
        <path d="M9.2 9.7c.4 2.1 2 3.7 4.1 4.1" />
        <path d="M9.8 8.8l1.4 1.1" />
        <path d="M13 13l1.2 1.3" />
      </svg>
    ),
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Thanks, ${form.name}! Your message has been received. I'll get back to you soon.`);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-grid">
          <div className="contact-info">
            <p className="contact-intro">
              Have an idea, a challenge, or a system that needs to work smarter? Let’s talk about how to make it happen.
            </p>
            <div className="contact-links">
              {CONTACT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="contact-link"
                  aria-label={link.label}
                  title={link.label}
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                >
                  <span className="contact-link-icon">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your message..."
                rows={5}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
