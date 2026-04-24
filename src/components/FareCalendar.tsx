import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useGlobal } from '../context/GlobalContext';
import { ACTIVITIES, BUS_ROUTES, CAB_TYPES, FLIGHTS, HOLIDAYS, HOTELS_DATA, TRAIN_ROUTES } from '../constants';

type ServiceType = 'flight' | 'hotel' | 'bus' | 'train' | 'holiday' | 'cab' | 'activity';

interface FareCalendarProps {
  onClose: () => void;
  origin: string;
  destination: string;
  serviceType: ServiceType;
  onSelectDate: (date: string) => void;
}

const normalize = (value: string) => value.trim().toLowerCase();

const includesLocation = (source: string, target: string) => normalize(source).includes(normalize(target));

const getServiceBasePrices = (serviceType: ServiceType, origin: string, destination: string) => {
  if (serviceType === 'flight') {
    const matchingFlights = FLIGHTS.filter(
      (flight) => includesLocation(flight.from, origin) && includesLocation(flight.to, destination)
    );
    const pool = matchingFlights.length > 0
      ? matchingFlights
      : FLIGHTS.filter((flight) => includesLocation(flight.to, destination));

    return (pool.length > 0 ? pool : FLIGHTS).map((flight) => flight.price);
  }

  if (serviceType === 'hotel') {
    const matchingHotels = HOTELS_DATA.filter((hotel) => includesLocation(hotel.location, destination));
    return (matchingHotels.length > 0 ? matchingHotels : HOTELS_DATA).map((hotel) => hotel.pricePerNight);
  }

  if (serviceType === 'bus') {
    const matchingBuses = BUS_ROUTES.filter(
      (bus) => includesLocation(bus.from, origin) && includesLocation(bus.to, destination)
    );
    const pool = matchingBuses.length > 0
      ? matchingBuses
      : BUS_ROUTES.filter((bus) => includesLocation(bus.to, destination));

    return (pool.length > 0 ? pool : BUS_ROUTES).map((bus) => bus.price);
  }

  if (serviceType === 'train') {
    const matchingTrains = TRAIN_ROUTES.filter(
      (train) => includesLocation(train.from, origin) && includesLocation(train.to, destination)
    );
    const pool = matchingTrains.length > 0
      ? matchingTrains
      : TRAIN_ROUTES.filter((train) => includesLocation(train.to, destination));

    return (pool.length > 0 ? pool : TRAIN_ROUTES).map((train) => {
      const fares = Object.values(train.classes || {}).map((travelClass: any) => travelClass.fare);
      return Math.min(...fares);
    });
  }

  if (serviceType === 'holiday') {
    const matchingPackages = HOLIDAYS.filter((holiday) => includesLocation(holiday.destination, destination));
    return (matchingPackages.length > 0 ? matchingPackages : HOLIDAYS).map((holiday) => holiday.price);
  }

  if (serviceType === 'cab') {
    return CAB_TYPES.map((cab) => cab.baseFare);
  }

  if (serviceType === 'activity') {
    const matchingActivities = ACTIVITIES.filter((activity) => includesLocation(activity.location, destination));
    return (matchingActivities.length > 0 ? matchingActivities : ACTIVITIES).map((activity) => activity.price);
  }

  return [3000];
};

const getTrendModifiers = (serviceType: ServiceType, dayIndex: number, weekday: number) => {
  const weekendBoost = weekday === 5 || weekday === 6 ? 0.12 : weekday === 0 ? 0.08 : 0;
  const advanceBookingCurve = Math.sin((dayIndex + 2) / 4) * 0.05;

  if (serviceType === 'hotel') return weekendBoost + advanceBookingCurve + 0.08;
  if (serviceType === 'holiday') return weekendBoost + advanceBookingCurve + 0.12;
  if (serviceType === 'activity') return weekendBoost + advanceBookingCurve + 0.06;
  if (serviceType === 'flight') return weekendBoost + advanceBookingCurve + (dayIndex % 7 === 1 ? -0.07 : 0);
  if (serviceType === 'train') return (weekday === 4 || weekday === 5 ? 0.06 : 0) + advanceBookingCurve * 0.8;
  if (serviceType === 'bus') return weekendBoost * 0.7 + advanceBookingCurve * 0.6;
  if (serviceType === 'cab') return weekendBoost * 0.5 + advanceBookingCurve * 0.4;

  return advanceBookingCurve;
};

const getServiceCopy = (serviceType: ServiceType) => {
  if (serviceType === 'hotel') return { title: 'Nightly Trends', subtitle: 'Lowest nightly stays', footnote: '*Nightly rates shift by occupancy, events, and cancellation flexibility.' };
  if (serviceType === 'holiday') return { title: 'Package Trends', subtitle: 'Lowest package rates', footnote: '*Package prices vary by inclusions, departure windows, and demand.' };
  if (serviceType === 'activity') return { title: 'Activity Trends', subtitle: 'Best experience rates', footnote: '*Activity prices move based on slot demand and operator inventory.' };
  if (serviceType === 'cab') return { title: 'Cab Trends', subtitle: 'Estimated pickup fares', footnote: '*Cab fares change with route demand, timing, and vehicle category.' };
  if (serviceType === 'bus') return { title: 'Bus Trends', subtitle: 'Lowest seat fares', footnote: '*Bus fares fluctuate based on occupancy and departure timing.' };
  if (serviceType === 'train') return { title: 'Train Trends', subtitle: 'Lowest class fares', footnote: '*Train fare guidance reflects the lowest available class in the current route pool.' };
  return { title: 'Flight Trends', subtitle: 'Lowest flight fares', footnote: '*Flight prices fluctuate based on demand and route inventory.' };
};

const FareCalendar: React.FC<FareCalendarProps> = ({ onClose, origin, destination, serviceType, onSelectDate }) => {
  const { convertPrice } = useGlobal();

  const priceDays = useMemo(() => {
    const basePrices = getServiceBasePrices(serviceType, origin, destination);
    const baseFloor = Math.max(1, Math.min(...basePrices));
    const baseAverage = Math.round(basePrices.reduce((sum, price) => sum + price, 0) / basePrices.length);

    const days = Array.from({ length: 30 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      const weekday = date.getDay();
      const modifier = getTrendModifiers(serviceType, index, weekday);
      const oscillation = ((index % 5) - 2) * 0.018;
      const projectedPrice = Math.max(
        baseFloor,
        Math.round(baseAverage * (1 + modifier + oscillation))
      );

      return {
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
        price: projectedPrice,
        isCheapest: false
      };
    });

    const minPrice = Math.min(...days.map((day) => day.price));
    return days.map((day) => ({ ...day, isCheapest: day.price === minPrice }));
  }, [destination, origin, serviceType]);

  const copy = getServiceCopy(serviceType);
  const routeLabel = serviceType === 'hotel' || serviceType === 'activity' || serviceType === 'holiday'
    ? destination
    : `${origin} → ${destination}`;

  const modal = (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center p-4 bg-slate-950/72 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
      style={{ paddingTop: 'calc(var(--navbar-safe-offset) + 12px)' }}
      onMouseDown={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{copy.title}</h2>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.18em] mt-1">
              {copy.subtitle} for {routeLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="px-5 py-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[min(46vh,calc(100vh-var(--navbar-safe-offset)-170px))] overflow-y-auto scrollbar-hide">
          {priceDays.map((day) => (
            <div
              key={day.date}
              onClick={() => {
                onSelectDate(day.date);
                onClose();
              }}
              className={`p-3.5 rounded-[1.25rem] border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
                day.isCheapest
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{day.weekday}</div>
              <div className="text-base font-black text-slate-900 dark:text-white">{day.display}</div>
              <div className={`text-xs font-black mt-2 ${day.isCheapest ? 'text-green-600' : 'text-blue-500'}`}>
                {convertPrice(day.price)}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Best Value Window</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 max-w-[220px] text-right italic">
            {copy.footnote}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default FareCalendar;
