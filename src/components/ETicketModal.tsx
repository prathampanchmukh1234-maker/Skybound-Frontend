import React from 'react';
import { Booking } from '../types';
import { useGlobal } from '../context/GlobalContext';
import { downloadTicket, printTicket } from '../utils/pdfUtils';
import { buildTicketVerificationDataUri, formatBookingDate, getBookingDisplayTime, getBookingExperienceDisplay, getBookingVenueInfo } from '../utils/ticketUtils';

interface ETicketModalProps {
  booking: Booking;
  onClose: () => void;
}

const formatLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ETicketModal: React.FC<ETicketModalProps> = ({ booking, onClose }) => {
  const { convertPrice, user } = useGlobal();
  const venueInfo = getBookingVenueInfo(booking);
  const bookingTime = getBookingDisplayTime(booking);
  const bookingExperience = getBookingExperienceDisplay(booking);
  const details = (booking.details || {}) as Record<string, any>;
  const routeFrom = booking.from_city || details.from || 'DEL';
  const routeTo = booking.to_city || details.to || details.destination || 'BOM';
  const posterSrc =
    booking.poster ||
    details.logo ||
    details.image ||
    (booking as any).image ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';
  const ticketTitle =
    booking.title ||
    details.airline ||
    details.title ||
    (booking as any).name ||
    'SykBound Booking';
  const qrCodeSrc = buildTicketVerificationDataUri(booking, user?.name);
  const seatDisplay = Array.isArray(booking.seat) ? booking.seat.join(', ') : booking.seat || 'Standard';
  const showVisual = Boolean(booking.poster || details.logo || details.image || (booking as any).image);

  const additionalDetails = Object.entries(details)
    .filter(([key, value]) => {
      if (value === undefined || value === null || value === '') return false;
      return !['from', 'to', 'destination', 'title', 'airline', 'logo', 'image', 'time', 'show_time', 'departure', 'departureTime', 'venue', 'location'].includes(key);
    })
    .slice(0, 8);

  const handlePrint = async () => {
    await printTicket('ticket-export-area');
  };

  const handleDownload = async () => {
    await downloadTicket('ticket-export-area', `SykBound_Ticket_${booking.id}.pdf`);
  };

  const TicketBody = ({ compact }: { compact?: boolean }) => (
    <div className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${compact ? 'rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[92vh]' : 'rounded-[2.5rem]'}`}>
      <div className="azure-btn p-6 flex justify-between items-center text-white no-print">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
            <i className="fa-solid fa-ticket text-sm"></i>
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tighter">Electronic Ticket</h3>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-80">ID: {booking.id}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <div className={`${compact ? 'hidden' : 'block'} p-8 bg-blue-600 text-white text-center`}>
        <h1 className="text-3xl font-black">SYKBOUND ELITE</h1>
        <p className="text-sm font-bold uppercase tracking-widest">Electronic Boarding Document</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr,1.2fr] gap-6 md:gap-8">
          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Passenger Name</label>
              <div className="font-black text-base">{user?.name || 'Traveler User'}</div>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Seat / Berth</label>
              <div className="font-black text-blue-600 text-base">{seatDisplay}</div>
            </div>
            {venueInfo.venueName && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Venue</label>
                <div className="font-black text-base leading-tight">{venueInfo.venueName}</div>
              </div>
            )}
            {venueInfo.location && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Area / City</label>
                <div className="font-black text-base leading-tight">{venueInfo.location}</div>
              </div>
            )}
            {(bookingTime || bookingExperience) && (
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Show / Experience</label>
                <div className="font-black text-base leading-tight">{[bookingTime, bookingExperience].filter(Boolean).join(' • ')}</div>
              </div>
            )}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Status</label>
              <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                booking.status === 'confirmed'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-100 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800'
              }`}>
                <span className={`w-1 h-1 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {booking.status}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            {showVisual ? (
              <div className="flex flex-col items-center gap-3 mb-5">
                <img
                  src={posterSrc}
                  alt={ticketTitle}
                  className="w-24 h-24 object-cover rounded-2xl shadow-lg"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';
                  }}
                />
                <div className="text-lg font-black text-center leading-tight">{ticketTitle}</div>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-3">
                <div className="text-2xl font-black">{routeFrom}</div>
                <i className={`fa-solid ${booking.type === 'flight' ? 'fa-plane' : booking.type === 'bus' ? 'fa-bus' : booking.type === 'train' ? 'fa-train' : 'fa-hotel'} text-blue-600`}></i>
                <div className="text-2xl font-black">{routeTo}</div>
              </div>
            )}

            <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-700">
              {[
                ['Type', booking.type.toUpperCase()],
                ['Booking ID', booking.id],
                [(bookingTime || bookingExperience) ? 'Time / Experience' : 'Route', [bookingTime, bookingExperience].filter(Boolean).join(' • ') || `${routeFrom} → ${routeTo}`],
                ['Fare', convertPrice(booking.total_price ?? booking.totalPrice)],
                ['Venue / Route', venueInfo.venueName || `${routeFrom} → ${routeTo}`],
                ['Location', venueInfo.location || details.location || 'Not provided'],
                ['Seat(s)', seatDisplay],
                ['Email', user?.email || 'Not provided'],
                ['Date', formatBookingDate(booking)]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-[10px] font-bold text-slate-500">
                  <span>{label}:</span>
                  <span className="text-slate-900 dark:text-white text-right max-w-[220px] leading-tight break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {additionalDetails.length > 0 && (
          <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 md:p-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 mb-4">Additional Ticket Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-bold text-slate-500">
              {additionalDetails.map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-white dark:bg-slate-900 px-4 py-3 border border-slate-100 dark:border-slate-800">
                  <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">{formatLabel(key)}</span>
                  <span className="text-slate-900 dark:text-white break-words">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-5 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full">
            <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center shrink-0">
              <img src={qrCodeSrc} alt="Ticket verification QR" className="w-full h-full rounded-xl object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-500 text-[10px] font-medium max-w-[320px]">
                Present this QR code at the counter for instant verification, or share the booking ID if scanning is unavailable.
              </p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 break-all">{booking.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto no-print">
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 md:flex-none px-6 py-3 azure-btn text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div id="ticket-print-area" className="w-full max-w-2xl relative animate-in zoom-in duration-300">
        <TicketBody compact />
      </div>

      <div className="fixed left-[-10000px] top-0 w-[980px] pointer-events-none opacity-100">
        <div id="ticket-export-area">
          <TicketBody />
        </div>
      </div>
    </div>
  );
};

export default ETicketModal;
