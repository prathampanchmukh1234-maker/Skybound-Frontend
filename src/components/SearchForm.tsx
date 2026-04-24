import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { LOCATIONS } from '../constants';
import FareCalendar from './FareCalendar';
import { motion } from 'framer-motion';

type ServiceType = 'flight' | 'hotel' | 'bus' | 'train' | 'holiday' | 'cab' | 'activity';
type TripType = 'one-way' | 'round-trip' | 'multi-city';
type LocationOption = (typeof LOCATIONS)[number];

interface MultiCitySegment {
  from: string;
  to: string;
  date: string;
}

const todayISO = new Date().toISOString().split('T')[0];
const tomorrowISO = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const defaultOrigin = 'Pune';

const normalizeLocationValue = (value: string) => value.trim().toLowerCase();

const getLocationMatch = (value: string) => {
  const normalizedValue = normalizeLocationValue(value);
  if (!normalizedValue) return null;

  return LOCATIONS.find((location) => {
    const normalizedName = normalizeLocationValue(location.name);
    const normalizedCode = normalizeLocationValue(location.code || '');
    return normalizedName === normalizedValue || normalizedCode === normalizedValue;
  });
};

const areSameLocations = (from: string, to: string) => {
  const normalizedFrom = normalizeLocationValue(from);
  const normalizedTo = normalizeLocationValue(to);

  if (!normalizedFrom || !normalizedTo) return false;
  if (normalizedFrom === normalizedTo) return true;

  const fromMatch = getLocationMatch(from);
  const toMatch = getLocationMatch(to);

  if (!fromMatch || !toMatch) return false;

  return normalizeLocationValue(fromMatch.name) === normalizeLocationValue(toMatch.name);
};

const isDomesticLocation = (value: string) => {
  const matchedLocation = getLocationMatch(value);
  return matchedLocation?.region === 'domestic';
};

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const { location: userLoc, convertPrice } = useGlobal();

  const [type, setType] = useState<ServiceType>('flight');
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [maxBudget, setMaxBudget] = useState(50000);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);

  const [formData, setFormData] = useState({
    from: 'Pune',
    to: '',
    departure: todayISO,
    returnDate: '',
    travelers: 1,
    travelClass: 'Economy'
  });

  const [multiCitySegments, setMultiCitySegments] = useState<MultiCitySegment[]>([
    { from: 'Pune', to: '', date: todayISO },
    { from: '', to: '', date: tomorrowISO }
  ]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const isDomesticOnly = useMemo(() => ['bus', 'train', 'cab', 'activity'].includes(type), [type]);

  useEffect(() => {
    if (userLoc && !formData.from) {
      setFormData((prev) => ({ ...prev, from: userLoc }));
    }
  }, [userLoc, formData.from]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveInput(null);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  useEffect(() => {
    if (type !== 'flight') {
      setTripType('one-way');
      setValidationError('');
      setShowCalendar(false);
    }

    if (type !== 'hotel' && type !== 'activity' && !formData.from.trim()) {
      setFormData((prev) => ({ ...prev, from: defaultOrigin }));
    }
  }, [type, formData.from]);

  useEffect(() => {
    if (tripType !== 'round-trip' && formData.returnDate) {
      setFormData((prev) => ({ ...prev, returnDate: '' }));
    }
  }, [tripType, formData.returnDate]);

  const getFilteredLocations = (value: string) => {
    const normalizedValue = value.trim().toLowerCase();

    const eligibleLocations = LOCATIONS.filter((location) => {
      if (isDomesticOnly && location.region !== 'domestic') return false;
      if (!normalizedValue) return true;

      return (
        location.name.toLowerCase().includes(normalizedValue) ||
        location.code?.toLowerCase().includes(normalizedValue) ||
        location.country.toLowerCase().includes(normalizedValue)
      );
    });

    return eligibleLocations
      .sort((a, b) => {
        if (!normalizedValue) {
          const featuredCodes = ['DEL', 'BOM', 'GOA', 'SXR', 'LEH', 'DXB', 'LHR', 'CDG', 'SIN', 'BKK'];
          const aFeatured = featuredCodes.includes(a.id || '');
          const bFeatured = featuredCodes.includes(b.id || '');
          if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
          return a.name.localeCompare(b.name);
        }

        const aStarts = a.name.toLowerCase().startsWith(normalizedValue) || a.code?.toLowerCase().startsWith(normalizedValue);
        const bStarts = b.name.toLowerCase().startsWith(normalizedValue) || b.code?.toLowerCase().startsWith(normalizedValue);

        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, normalizedValue ? 12 : 15);
  };

  const openSuggestions = (inputKey: string, value: string, showAll = false) => {
    setActiveInput(inputKey);
    setSuggestions(getFilteredLocations(showAll ? '' : value));
  };

  const updateMultiCitySegment = (index: number, field: keyof MultiCitySegment, value: string) => {
    setMultiCitySegments((previousSegments) => {
      const nextSegments = previousSegments.map((segment) => ({ ...segment }));
      const currentSegment = nextSegments[index];
      const previousDestination = currentSegment.to;

      currentSegment[field] = value;

      if (field === 'to' && index < nextSegments.length - 1) {
        const nextSegment = nextSegments[index + 1];
        if (!nextSegment.from || nextSegment.from === previousDestination) {
          nextSegment.from = value;
        }
      }

      if (field === 'date') {
        for (let segmentIndex = index + 1; segmentIndex < nextSegments.length; segmentIndex += 1) {
          const priorDate = nextSegments[segmentIndex - 1].date || todayISO;
          if (!nextSegments[segmentIndex].date || nextSegments[segmentIndex].date < priorDate) {
            nextSegments[segmentIndex].date = priorDate;
          }
        }
      }

      return nextSegments;
    });
  };

  const selectSuggestion = (inputKey: string, locationName: string) => {
    if (inputKey.startsWith('segment-')) {
      const [, indexValue, field] = inputKey.split('-');
      updateMultiCitySegment(Number(indexValue), field as 'from' | 'to', locationName);
    } else {
      setFormData((prev) => ({
        ...prev,
        [inputKey]: locationName
      }));
    }

    setActiveInput(null);
    setSuggestions([]);
    setValidationError('');
  };

  const addMultiCitySegment = () => {
    setMultiCitySegments((previousSegments) => {
      if (previousSegments.length >= 5) return previousSegments;

      const lastSegment = previousSegments[previousSegments.length - 1];
      return [
        ...previousSegments,
        {
          from: lastSegment.to || '',
          to: '',
          date: lastSegment.date || todayISO
        }
      ];
    });
  };

  const removeMultiCitySegment = (index: number) => {
    setMultiCitySegments((previousSegments) => {
      if (previousSegments.length <= 2) return previousSegments;

      const nextSegments = previousSegments
        .filter((_, segmentIndex) => segmentIndex !== index)
        .map((segment) => ({ ...segment }));

      for (let segmentIndex = 1; segmentIndex < nextSegments.length; segmentIndex += 1) {
        if (!nextSegments[segmentIndex].from || nextSegments[segmentIndex].from === previousSegments[index]?.to) {
          nextSegments[segmentIndex].from = nextSegments[segmentIndex - 1].to;
        }

        if (nextSegments[segmentIndex].date < nextSegments[segmentIndex - 1].date) {
          nextSegments[segmentIndex].date = nextSegments[segmentIndex - 1].date;
        }
      }

      return nextSegments;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (type === 'flight' && tripType === 'multi-city') {
      const normalizedSegments = multiCitySegments.map((segment) => ({
        from: segment.from.trim(),
        to: segment.to.trim(),
        date: segment.date
      }));

      if (normalizedSegments.length < 2) {
        setValidationError('Add at least two legs for a multi-city search.');
        return;
      }

      for (let index = 0; index < normalizedSegments.length; index += 1) {
        const segment = normalizedSegments[index];

        if (!segment.from || !segment.to || !segment.date) {
          setValidationError(`Complete From, To, and Date for leg ${index + 1}.`);
          return;
        }

        if (areSameLocations(segment.from, segment.to)) {
          setValidationError(`From and To cannot be the same for leg ${index + 1}.`);
          return;
        }

        if (index > 0) {
          const previousSegment = normalizedSegments[index - 1];

          if (!areSameLocations(segment.from, previousSegment.to)) {
            setValidationError(`Leg ${index + 1} must start from ${previousSegment.to}.`);
            return;
          }

          if (segment.date < previousSegment.date) {
            setValidationError(`Leg ${index + 1} date cannot be before leg ${index}.`);
            return;
          }
        }
      }

      const firstSegment = normalizedSegments[0];
      const lastSegment = normalizedSegments[normalizedSegments.length - 1];
      const queryParams = new URLSearchParams({
        type: 'flight',
        tripType: 'multi-city',
        from: firstSegment.from,
        to: lastSegment.to,
        departure: firstSegment.date,
        travelers: formData.travelers.toString(),
        class: formData.travelClass,
        budget: maxBudget.toString(),
        flexibleDates: String(flexibleDates),
        segments: JSON.stringify(normalizedSegments)
      }).toString();

      navigate(`/search?${queryParams}`);
      return;
    }

    const from = formData.from.trim();
    const to = formData.to.trim();

    if (type !== 'hotel' && type !== 'activity' && !from) {
      setValidationError(`Please select an origin. Default starting point is ${defaultOrigin}.`);
      return;
    }

    if (!to) {
      setValidationError('Please select a destination.');
      return;
    }

    if ((type === 'cab' || type === 'activity') && !isDomesticLocation(to)) {
      setValidationError('Please select an Indian city only.');
      return;
    }

    if (type === 'cab' && !isDomesticLocation(from)) {
      setValidationError('Please select an Indian pickup city only.');
      return;
    }

    if (type !== 'hotel' && type !== 'activity' && areSameLocations(from, to)) {
      setValidationError('Origin and destination cannot be the same.');
      return;
    }

    if (type === 'flight' && tripType === 'round-trip') {
      if (!formData.returnDate) {
        setValidationError('Please select a return date for round-trip.');
        return;
      }

      if (formData.returnDate < formData.departure) {
        setValidationError('Return date cannot be earlier than departure date.');
        return;
      }
    }

    const queryParams = new URLSearchParams({
      type,
      to,
      departure: formData.departure,
      budget: maxBudget.toString()
    });

    if (type !== 'hotel' && type !== 'activity') {
      queryParams.set('from', from);
    }

    if (type === 'flight') {
      queryParams.set('tripType', tripType);
      queryParams.set('travelers', formData.travelers.toString());
      queryParams.set('class', formData.travelClass);
      queryParams.set('flexibleDates', String(flexibleDates));

      if (tripType === 'round-trip' && formData.returnDate) {
        queryParams.set('return', formData.returnDate);
      }
    }

    navigate(`/search?${queryParams.toString()}`);
  };

  const renderSuggestions = (inputKey: string) => {
    if (activeInput !== inputKey || suggestions.length === 0) return null;

    return (
      <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] z-[220] overflow-y-auto max-h-[400px] animate-in fade-in slide-in-from-top-4 duration-300 scrollbar-hide">
        <div className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          Recommended Locations
        </div>
        {suggestions.map((location) => (
          <button
            key={`${inputKey}-${location.id}`}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              selectSuggestion(inputKey, location.name);
            }}
            className="w-full px-5 sm:px-8 py-4 sm:py-5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center gap-4 group transition-colors text-left"
          >
            <div>
              <span className="font-black text-base text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">{location.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{location.country}</span>
            </div>
            {location.code && (
              <span className="text-[11px] font-black bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                {location.code}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-3xl p-5 sm:p-8 md:p-14 relative z-30 max-w-6xl mx-auto border border-slate-100 dark:border-slate-800 shadow-2xl transition-all duration-500"
    >
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8 sm:mb-12 border-b dark:border-slate-800 pb-8 sm:pb-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl">
          {(['flight', 'hotel', 'bus', 'train', 'holiday', 'cab', 'activity'] as ServiceType[]).map((service) => (
            <motion.button
              key={service}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setType(service);
                setValidationError('');
                setActiveInput(null);
                setSuggestions([]);
              }}
              className={`px-4 sm:px-6 py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.18em] transition-all flex items-center gap-2 ${
                type === service
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <i className={`fa-solid ${
                service === 'flight'
                  ? 'fa-plane'
                  : service === 'hotel'
                    ? 'fa-hotel'
                    : service === 'bus'
                      ? 'fa-bus'
                      : service === 'train'
                        ? 'fa-train'
                        : service === 'holiday'
                          ? 'fa-umbrella-beach'
                          : service === 'cab'
                            ? 'fa-car'
                            : 'fa-ticket'
              }`}></i> {service}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full xl:w-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Max Budget</span>
            <span className="text-sm font-black text-indigo-600 font-display">{convertPrice(maxBudget)}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="200000"
            step="5000"
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-full sm:w-40 accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      {type === 'flight' && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 mb-8 sm:mb-10 px-1 sm:px-4">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            {([
              { label: 'One Way', value: 'one-way' },
              { label: 'Round-Trip', value: 'round-trip' },
              { label: 'Multi-City', value: 'multi-city' }
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTripType(option.value);
                  setValidationError('');
                  setActiveInput(null);
                  setSuggestions([]);
                }}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  tripType === option.value
                    ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 lg:ml-auto">
            <input
              type="checkbox"
              id="flexi"
              checked={flexibleDates}
              onChange={(e) => setFlexibleDates(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="flexi" className="text-[10px] font-black uppercase text-slate-400 cursor-pointer select-none tracking-widest">
              Flexible Dates (+/- 3 days)
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-6">
        {type === 'flight' && tripType === 'multi-city' ? (
          <div className="space-y-5">
            {multiCitySegments.map((segment, index) => (
              <div key={`segment-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative">
                <div className="md:col-span-4 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Leg {index + 1} Origin</label>
                  <input
                    type="text"
                    required
                    placeholder="From City"
                    autoComplete="off"
                    className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                    value={segment.from}
                    onFocus={() => openSuggestions(`segment-${index}-from`, segment.from, true)}
                    onChange={(e) => {
                      updateMultiCitySegment(index, 'from', e.target.value);
                      openSuggestions(`segment-${index}-from`, e.target.value);
                    }}
                  />
                  {renderSuggestions(`segment-${index}-from`)}
                </div>

                <div className="md:col-span-4 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Leg {index + 1} Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="To Destination"
                    autoComplete="off"
                    className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                    value={segment.to}
                    onFocus={() => openSuggestions(`segment-${index}-to`, segment.to, true)}
                    onChange={(e) => {
                      updateMultiCitySegment(index, 'to', e.target.value);
                      openSuggestions(`segment-${index}-to`, e.target.value);
                    }}
                  />
                  {renderSuggestions(`segment-${index}-to`)}
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Departure Date</label>
                  <input
                    type="date"
                    required
                    min={index === 0 ? todayISO : multiCitySegments[index - 1]?.date || todayISO}
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                    value={segment.date}
                    onChange={(e) => updateMultiCitySegment(index, 'date', e.target.value)}
                  />
                </div>

                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeMultiCitySegment(index)}
                    disabled={multiCitySegments.length <= 2}
                    className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove leg"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <button
                type="button"
                onClick={addMultiCitySegment}
                disabled={multiCitySegments.length >= 5}
                className="px-5 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Another Leg
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-[340px]">
                <select
                  value={formData.travelers}
                  onChange={(e) => setFormData((prev) => ({ ...prev, travelers: Number(e.target.value) }))}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>{count} Traveler{count > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <select
                  value={formData.travelClass}
                  onChange={(e) => setFormData((prev) => ({ ...prev, travelClass: e.target.value }))}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                >
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-indigo-600 text-white w-full md:w-auto md:min-w-[180px] py-5 px-8 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700"
              >
                Search
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 relative">
            {type !== 'hotel' && type !== 'activity' && (
              <div className="md:col-span-3 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Origin</label>
                <input
                  type="text"
                  required
                  placeholder="From City"
                  autoComplete="off"
                  className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  value={formData.from}
                  onFocus={() => openSuggestions('from', formData.from, true)}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, from: e.target.value }));
                    openSuggestions('from', e.target.value);
                  }}
                />
                {renderSuggestions('from')}
              </div>
            )}

            <div className={`${type === 'hotel' || type === 'activity' ? 'md:col-span-5' : 'md:col-span-3'} relative`}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
                {type === 'hotel' ? 'Search Hotels in' : type === 'activity' ? 'Search Activities in' : 'Destination'}
              </label>
              <input
                type="text"
                required
                placeholder={type === 'hotel' ? 'e.g. Mumbai, Goa, Dubai' : type === 'activity' ? 'e.g. Pune, Manali, Kerala' : 'To Destination'}
                autoComplete="off"
                className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                value={formData.to}
                onFocus={() => openSuggestions('to', formData.to, true)}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, to: e.target.value }));
                  openSuggestions('to', e.target.value);
                }}
              />
              {renderSuggestions('to')}
            </div>

            <div className="md:col-span-2 relative">
              <div className="flex justify-between items-center mb-3 px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {type === 'hotel' ? 'Check-In' : 'Departure'}
                </label>
                {type !== 'flight' || tripType !== 'round-trip' ? (
                  <button
                    type="button"
                    disabled={!formData.to}
                    onClick={() => setShowCalendar(true)}
                    className={`text-[9px] font-black uppercase tracking-tighter transition-all ${
                      !formData.to ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-indigo-600 hover:underline'
                    }`}
                    title={!formData.to ? 'Enter a destination to view price trends' : 'View lowest price calendar'}
                  >
                    <i className="fa-solid fa-calendar-days mr-1"></i> Trends
                  </button>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-300">Round-trip</span>
                )}
              </div>
              <input
                type="date"
                required
                min={todayISO}
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                value={formData.departure}
                onChange={(e) => {
                  const nextDeparture = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    departure: nextDeparture,
                    returnDate: prev.returnDate && prev.returnDate < nextDeparture ? nextDeparture : prev.returnDate
                  }));
                }}
              />
            </div>

            {type === 'flight' && tripType === 'round-trip' && (
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Return</label>
                <input
                  type="date"
                  required
                  min={formData.departure || todayISO}
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                  value={formData.returnDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, returnDate: e.target.value }))}
                />
              </div>
            )}

            {type === 'flight' && (
              <div className={`${tripType === 'round-trip' ? 'md:col-span-2' : 'md:col-span-2'} grid grid-cols-1 gap-4`}>
                <select
                  value={formData.travelers}
                  onChange={(e) => setFormData((prev) => ({ ...prev, travelers: Number(e.target.value) }))}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>{count} Traveler{count > 1 ? 's' : ''}</option>
                  ))}
                </select>
                <select
                  value={formData.travelClass}
                  onChange={(e) => setFormData((prev) => ({ ...prev, travelClass: e.target.value }))}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                >
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
            )}

            <div className={`${type === 'flight' ? 'md:col-span-2' : 'md:col-span-2'} flex flex-col justify-end`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-indigo-600 text-white w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700"
              >
                Search
              </motion.button>
            </div>
          </div>
        )}

        {validationError && (
          <p className="text-[11px] font-black uppercase tracking-wider text-red-500">{validationError}</p>
        )}
      </form>

      {showCalendar && (
        <FareCalendar
          onClose={() => setShowCalendar(false)}
          origin={formData.from || 'Source'}
          destination={formData.to || 'Destination'}
          serviceType={type}
          onSelectDate={(date) => setFormData((prev) => ({ ...prev, departure: date }))}
        />
      )}

      <div className="mt-8 sm:mt-12 flex flex-wrap gap-4 sm:gap-6 items-center border-t dark:border-slate-800 pt-8 sm:pt-10">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Popular Routes:</span>
        <div className="flex flex-wrap gap-3">
          {['Pune → Mumbai', 'Mumbai → Goa', 'Pune → Shirdi', 'Delhi → Leh'].map((route, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                const [from, to] = route.split(' → ');
                setFormData((prev) => ({ ...prev, from, to }));
                setValidationError('');
              }}
              className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100 dark:border-indigo-900/40"
            >
              {route}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchForm;
