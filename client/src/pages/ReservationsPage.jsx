import { useState } from 'react';
import { reservationService } from '../services';
import toast from 'react-hot-toast';
import { Calendar, Clock, Users, Search, Phone, Mail, User } from 'lucide-react';

const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '14:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

export default function ReservationsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', partySize: 2, occasion: '', specialRequests: '' });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await reservationService.create(form);
      setConfirmed(data.reservation);
      toast.success('Reservation submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await reservationService.lookup(lookupCode);
      setLookupResult(data.reservation);
    } catch {
      toast.error('Reservation not found');
      setLookupResult(null);
    }
  };

  if (confirmed) {
    return (
      <div className="page">
        <div className="confirmation-card">
          <div className="confirmation-icon">✅</div>
          <h2>Reservation Submitted!</h2>
          <p>We'll confirm your booking shortly.</p>
          <div className="confirmation-details">
            <p><strong>Confirmation Code:</strong> {confirmed.confirmationCode}</p>
            <p><strong>Date:</strong> {new Date(confirmed.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {confirmed.time}</p>
            <p><strong>Party Size:</strong> {confirmed.partySize}</p>
            <p><strong>Status:</strong> <span className={`status-badge status-${confirmed.status}`}>{confirmed.status}</span></p>
          </div>
          <p className="confirmation-note">Please save your confirmation code to check your reservation status.</p>
          <button className="btn btn-primary" onClick={() => setConfirmed(null)}>Make Another Reservation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page reservations-page">
      <div className="page-header">
        <h1>Reservations</h1>
        <p>Book your table at Ceylon Bar Restaurant</p>
      </div>

      <div className="reservations-grid">
        {/* Booking Form */}
        <div className="reservation-form-card">
          <h2>Book a Table</h2>
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-row">
              <div className="form-group">
                <label><User size={14} /> Full Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label><Mail size={14} /> Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label><Phone size={14} /> Phone</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+94 77 123 4567" />
              </div>
              <div className="form-group">
                <label><Users size={14} /> Party Size</label>
                <select value={form.partySize} onChange={(e) => setForm({ ...form, partySize: parseInt(e.target.value) })}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                  <option value={15}>11-15 people</option>
                  <option value={20}>16-20 people</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label><Calendar size={14} /> Date</label>
                <input type="date" required value={form.date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label><Clock size={14} /> Time</label>
                <select required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Occasion (optional)</label>
              <select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
                <option value="">None</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="business">Business Dinner</option>
                <option value="date">Date Night</option>
                <option value="family">Family Gathering</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Special Requests</label>
              <textarea rows={3} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} placeholder="Dietary requirements, accessibility needs, seating preferences..." />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Request Reservation'}
            </button>
          </form>
        </div>

        {/* Lookup + Info */}
        <div className="reservation-sidebar">
          <div className="lookup-card">
            <h3><Search size={16} /> Check Reservation</h3>
            <form onSubmit={handleLookup}>
              <input placeholder="Enter confirmation code (e.g. CBR-ABC123)" value={lookupCode} onChange={(e) => setLookupCode(e.target.value)} />
              <button type="submit" className="btn btn-outline btn-sm">Look Up</button>
            </form>
            {lookupResult && (
              <div className="lookup-result">
                <p><strong>{lookupResult.name}</strong></p>
                <p>📅 {new Date(lookupResult.date).toLocaleDateString()} at {lookupResult.time}</p>
                <p>👥 {lookupResult.partySize} people</p>
                <p>Status: <span className={`status-badge status-${lookupResult.status}`}>{lookupResult.status}</span></p>
              </div>
            )}
          </div>

          <div className="info-card">
            <h3>Opening Hours</h3>
            <div className="hours-list">
              <div><span>Mon – Fri</span><span>12:00 – 22:00</span></div>
              <div><span>Saturday</span><span>11:00 – 23:00</span></div>
              <div><span>Sunday</span><span>11:00 – 21:00</span></div>
            </div>
          </div>

          <div className="info-card">
            <h3>Contact Us</h3>
            <p>📞 +94 11 234 5678</p>
            <p>📧 reservations@ceylonbar.com</p>
            <p>📍 42 Galle Road, Colombo 03</p>
          </div>
        </div>
      </div>
    </div>
  );
}
