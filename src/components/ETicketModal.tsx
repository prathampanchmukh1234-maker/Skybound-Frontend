
import React from 'react';
import { Booking } from '../types';
import { useGlobal } from '../context/GlobalContext';
import { downloadTicket } from '../utils/pdfUtils';
import { buildTicketVerificationDataUri, formatBookingDate, getBookingDisplayTime, getBookingExperienceDisplay, getBookingVenueInfo } from '../utils/ticketUtils';

interface ETicketModalProps {
  booking: Booking;
  onClose: () => void;
}

const ETicketModal: React.FC<ETicketModalProps> = ({ booking, onClose }) => {
  const { convertPrice, user } = useGlobal();
  const venueInfo = getBookingVenueInfo(booking);
  const bookingTime = getBookingDisplayTime(booking);
  const bookingExperience = getBookingExperienceDisplay(booking);
  const posterSrc = booking.poster || (booking as any).image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';
  const ticketTitle = booking.title || (booking as any).airline || (booking as any).name || 'SkyBound Booking';
  const qrCodeSrc = buildTicketVerificationDataUri(booking, user?.name);
  const seatDisplay = Array.isArray(booking.seat) ? booking.seat.join(', ') : (booking.seat || 'Standard');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    await downloadTicket('ticket-print-area', `SykBound_Ticket_${booking.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div id="ticket-print-area" className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[3rem] shadow-2xl relative animate-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
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

        {/* Header for Print only */}
        <div className="hidden print:block p-8 bg-blue-600 text-white text-center">
            <h1 className="text-3xl font-black">SYKBOUND ELITE</h1>
            <p className="text-sm font-bold uppercase tracking-widest">Electronic Boarding Document</p>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Passenger Info */}
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Passenger Name</label>
                <div className="font-black text-slate-900 dark:text-white text-base">{user?.name || 'Traveler User'}</div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Seat / Berth</label>
                <div className="font-black text-blue-600 text-base">
                  {seatDisplay}
                </div>
              </div>
              {venueInfo.location && (
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Area / City</label>
                  <div className="font-black text-slate-900 dark:text-white text-base leading-tight">{venueInfo.location}</div>
                </div>
              )}
              {venueInfo.venueName && (
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Venue</label>
                  <div className="font-black text-slate-900 dark:text-white text-base leading-tight">{venueInfo.venueName}</div>
                </div>
              )}
              {(bookingTime || bookingExperience) && (
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Show / Experience</label>
                  <div className="font-black text-slate-900 dark:text-white text-base leading-tight">
                    {[bookingTime, bookingExperience].filter(Boolean).join('  ')}
                  </div>
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

            {/* Travel Details */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 md:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                {booking.type === 'movie' || booking.type === 'concert' || booking.type === 'service' ? (
                  <div className="flex flex-col items-center w-full gap-2">
                    <img 
                      src={posterSrc} 
                      alt={ticketTitle} 
                      className="w-20 h-28 md:w-24 md:h-32 object-cover rounded-2xl shadow-lg"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'; }}
                    />
                    <div className="text-lg font-black text-slate-900 dark:text-white text-center leading-tight">
                      {ticketTitle}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{booking.from_city || (booking.details as any)?.from || 'DEL'}</div>
                    <i className={`fa-solid ${booking.type === 'flight' ? 'fa-plane' : booking.type === 'bus' ? 'fa-bus' : booking.type === 'train' ? 'fa-train' : 'fa-hotel'} text-blue-600`}></i>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{booking.to_city || (booking.details as any)?.to || (booking.details as any)?.destination || 'BOM'}</div>
                  </>
                )}
              </div>
              <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Type:</span>
                  <span className="text-slate-900 dark:text-white uppercase">{booking.type}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Booking ID:</span>
                  <span className="text-slate-900 dark:text-white text-right max-w-[160px] break-all">{booking.id}</span>
                </div>

                {(bookingTime || bookingExperience) && (
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Time / Experience:</span>
                    <span className="text-slate-900 dark:text-white text-right max-w-[160px] leading-tight">{[bookingTime, bookingExperience].filter(Boolean).join(' • ')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Fare:</span>
                  <span className="text-slate-900 dark:text-white">{convertPrice(booking.total_price ?? booking.totalPrice)}</span>
                </div>
                {venueInfo.venueName && (
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Venue / Route:</span>
                    <span className="text-slate-900 dark:text-white text-right max-w-[160px] leading-tight">{venueInfo.venueName}</span>
                  </div>
                )}
                {venueInfo.location && (
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Location:</span>
                    <span className="text-slate-900 dark:text-white text-right max-w-[160px] leading-tight">{venueInfo.location}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Seat(s):</span>
                  <span className="text-slate-900 dark:text-white text-right max-w-[160px] leading-tight">{seatDisplay}</span>
                </div>
                {user?.email && (
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Email:</span>
                    <span className="text-slate-900 dark:text-white text-right max-w-[160px] leading-tight break-all">{user.email}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Date:</span>
                  <span className="text-slate-900 dark:text-white">{formatBookingDate(booking)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Area */}
          <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full">
              <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-inner border border-slate-100 flex items-center justify-center shrink-0">
                <img src={qrCodeSrc} alt="Ticket verification QR" className="w-full h-full rounded-xl object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-[10px] font-medium max-w-[220px]">Present this QR code at the check-in counter for instant verification, or share the booking ID if scanning is unavailable.</p>
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
    </div>
  );
};

export default ETicketModal;
