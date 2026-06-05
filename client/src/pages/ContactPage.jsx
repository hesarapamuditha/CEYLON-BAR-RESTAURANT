import { useState } from 'react';
import { contactService } from '../services';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.submit(form);
      setSent(true);
      toast.success("Message sent! We'll reply soon.");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page contact-page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>

      <div className="contact-grid">
        {/* Form */}
        <div className="contact-form-card">
          {sent ? (
            <div className="success-state">
              <div style={{ fontSize: '3rem' }}>✉️</div>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" required placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone (optional)</label>
                    <input type="tel" placeholder="+94 77 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input type="text" required placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows={5} required placeholder="Tell us more..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Info */}
        <div className="contact-info">
          <div className="info-block">
            <MapPin size={20} className="info-icon" />
            <div>
              <h4>Location</h4>
              <p>42 Galle Road, Colombo 03<br />Sri Lanka</p>
            </div>
          </div>
          <div className="info-block">
            <Phone size={20} className="info-icon" />
            <div>
              <h4>Phone</h4>
              <p>+94 11 234 5678<br />+94 77 987 6543</p>
            </div>
          </div>
          <div className="info-block">
            <Mail size={20} className="info-icon" />
            <div>
              <h4>Email</h4>
              <p>hello@ceylonbar.com<br />reservations@ceylonbar.com</p>
            </div>
          </div>
          <div className="info-block">
            <Clock size={20} className="info-icon" />
            <div>
              <h4>Hours</h4>
              <p>Mon–Fri: 12:00 – 22:00<br />Sat–Sun: 11:00 – 23:00</p>
            </div>
          </div>

          <div className="map-placeholder">
            <div className="map-pin">📍</div>
            <p>Ceylon Bar Restaurant<br />42 Galle Road, Colombo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
