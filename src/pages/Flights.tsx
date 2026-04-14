import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { LOCATIONS } from '../constants';

type TripType = 'one-way' | 'round-trip' | 'multi-city';

interface MultiCitySegment {
  from: string;
  to: string;
  date: string;
}

const todayISO = new Date().toISOString().split('T')[0];

const Flights: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();

  const [tripType, setTripType] = useState<TripType>('one-way');
  const [formData, setFormData] = useState({
    from: 'Pune',
    to: '',
    departureDate: todayISO,
    returnDate: '',
    travelers: 1,
    travelClass: 'Economy'
  });

  const [multiCitySegments, setMultiCitySegments] = useState<MultiCitySegment[]>([
    { from: 'Pune', to: 'Mumbai', date: todayISO },
    { from: 'Mumbai', to: '', date: todayISO }
  ]);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveInput(null);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getLocations = (val: string) =>
    LOCATIONS.filter((location) =>
      location.name.toLowerCase().includes(val.toLowerCase()) ||
      (location.code && location.code.toLowerCase().includes(val.toLowerCase()))
    ).slice(0, 8);

  const openSuggestions = (value: string, inputKey: string) => {
    setSuggestions(getLocations(value));
    setActiveInput(inputKey);
  };

  const selectLocation = (inputKey: string, locationName: string) => {
    if (inputKey.startsWith('single-')) {
      const field = inputKey.replace('single-', '') as 'from' | 'to';
      setFormData((prev) => ({ ...prev, [field]: locationName }));
    } else {
      const [, indexStr, field] = inputKey.split('-');
      const index = Number(indexStr);
      updateMultiCitySegment(index, field as 'from' | 'to', locationName);
    }

    setSuggestions([]);
    setActiveInput(null);
  };

  const updateMultiCitySegment = (index: number, field: keyof MultiCitySegment, value: string) => {
    setMultiCitySegments((previousSegments) => {
      const nextSegments = [...previousSegments];
      const current = { ...nextSegments[index] };
      const oldTo = current.to;

      current[field] = value;
      nextSegments[index] = current;

      if (field === 'to' && index < nextSegments.length - 1) {
        const nextLeg = { ...nextSegments[index + 1] };
        if (!nextLeg.from || nextLeg.from === oldTo) {
          nextLeg.from = value;
          nextSegments[index + 1] = nextLeg;
        }
      }

      if (field === 'date' && index < nextSegments.length - 1) {
        const nextLeg = { ...nextSegments[index + 1] };
        if (nextLeg.date < value) {
          nextLeg.date = value;
          nextSegments[index + 1] = nextLeg;
        }
      }

      return nextSegments;
    });
  };

  const addMultiCitySegment = () => {
    setMultiCitySegments((previousSegments) => {
      if (previousSegments.length >= 5) return previousSegments;

      const last = previousSegments[previousSegments.length - 1];
      return [
        ...previousSegments,
        {
          from: last.to || '',
          to: '',
          date: last.date || todayISO
        }
      ];
    });
  };

  const removeMultiCitySegment = (index: number) => {
    setMultiCitySegments((previousSegments) => {
      if (previousSegments.length <= 2) return previousSegments;
      return previousSegments.filter((_, segmentIndex) => segmentIndex !== index);
    });
  };

  const renderSuggestions = (inputKey: string) => {
    if (suggestions.length === 0 || activeInput !== inputKey) return null;

    return (
      <div className="absolute top-[105%] left-0 right-0 z-[220] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
        {suggestions.map((location) => (
          <button
            key={location.code}
            type="button"
            onClick={() => selectLocation(inputKey, location.name)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 dark:text-white">{location.name}</span>
                {location.code && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">{location.code}</span>}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{location.country}</div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (tripType === 'multi-city') {
      const normalizedSegments = multiCitySegments.map((segment) => ({
        from: segment.from.trim(),
        to: segment.to.trim(),
        date: segment.date
      }));

      if (normalizedSegments.length < 2) {
        setValidationError('Add at least two flight legs for a multi-city search.');
        return;
      }

      for (let i = 0; i < normalizedSegments.length; i += 1) {
        const segment = normalizedSegments[i];
        if (!segment.from || !segment.to || !segment.date) {
          setValidationError(`Complete From, To, and Date for leg ${i + 1}.`);
          return;
        }

        if (segment.from.toLowerCase() === segment.to.toLowerCase()) {
          setValidationError(`From and To cannot be the same for leg ${i + 1}.`);
          return;
        }

        if (i > 0) {
          const previous = normalizedSegments[i - 1];
          if (previous.to.toLowerCase() !== segment.from.toLowerCase()) {
            setValidationError(`Leg ${i + 1} must start from ${previous.to}.`);
            return;
          }

          if (segment.date < previous.date) {
            setValidationError(`Leg ${i + 1} date cannot be before leg ${i}.`);
            return;
          }
        }
      }

      const firstLeg = normalizedSegments[0];
      const lastLeg = normalizedSegments[normalizedSegments.length - 1];
      const params = new URLSearchParams({
        type: 'flight',
        tripType: 'multi-city',
        from: firstLeg.from,
        to: lastLeg.to,
        departure: firstLeg.date,
        travelers: formData.travelers.toString(),
        class: formData.travelClass,
        segments: JSON.stringify(normalizedSegments)
      }).toString();

      navigate(`/search?${params}`);
      return;
    }

    const from = formData.from.trim();
    const to = (formData.to || 'Mumbai').trim();

    if (!from || !to || !formData.departureDate) {
      setValidationError('Please enter From, To, and Departure date.');
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      setValidationError('From and To cities cannot be the same.');
      return;
    }

    if (tripType === 'round-trip') {
      if (!formData.returnDate) {
        setValidationError('Please select a return date for round-trip.');
        return;
      }

      if (formData.returnDate < formData.departureDate) {
        setValidationError('Return date cannot be before departure date.');
        return;
      }
    }

    const queryParams = new URLSearchParams({
      type: 'flight',
      tripType,
      from,
      to,
      departure: formData.departureDate,
      travelers: formData.travelers.toString(),
      class: formData.travelClass
    });

    if (tripType === 'round-trip' && formData.returnDate) {
      queryParams.set('return', formData.returnDate);
    }

    navigate(`/search?${queryParams.toString()}`);
  };

  const tripTypeButtons: { label: string; value: TripType }[] = [
    { label: 'One-way', value: 'one-way' },
    { label: 'Round-trip', value: 'round-trip' },
    { label: 'Multi-city', value: 'multi-city' }
  ];

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="group mb-12 flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-600 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
        </button>

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              SkyBound<br />
              <span className="text-indigo-600">Aviation</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Premium flight bookings with global connectivity
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">IATA Certified</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-20 relative overflow-visible z-20">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>

          <div className="mb-8 flex flex-wrap gap-3" ref={dropdownRef}>
            {tripTypeButtons.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setTripType(item.value);
                  setValidationError('');
                  setSuggestions([]);
                  setActiveInput(null);
                }}
                className={`px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                  tripType === item.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            {tripType !== 'multi-city' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative">
                <div className="md:col-span-3 space-y-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">From</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                    <input
                      type="text"
                      placeholder="Pune (PNQ)"
                      value={formData.from}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, from: e.target.value }));
                        openSuggestions(e.target.value, 'single-from');
                      }}
                      onFocus={() => openSuggestions(formData.from, 'single-from')}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                    />
                  </div>
                  {renderSuggestions('single-from')}
                </div>

                <div className="md:col-span-3 space-y-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">To</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                    <input
                      type="text"
                      placeholder="Mumbai (BOM)"
                      value={formData.to}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, to: e.target.value }));
                        openSuggestions(e.target.value, 'single-to');
                      }}
                      onFocus={() => openSuggestions(formData.to, 'single-to')}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                    />
                  </div>
                  {renderSuggestions('single-to')}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Departure</label>
                  <input
                    type="date"
                    min={todayISO}
                    value={formData.departureDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, departureDate: e.target.value }))}
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                  />
                </div>

                {tripType === 'round-trip' && (
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Return</label>
                    <input
                      type="date"
                      min={formData.departureDate || todayISO}
                      value={formData.returnDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, returnDate: e.target.value }))}
                      className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                    />
                  </div>
                )}

                <div className={`${tripType === 'round-trip' ? 'md:col-span-2' : 'md:col-span-4'} space-y-3`}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Travelers & Class</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                      <select
                        value={formData.travelers}
                        onChange={(e) => setFormData((prev) => ({ ...prev, travelers: Number(e.target.value) }))}
                        className="w-full pl-11 pr-4 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((count) => (
                          <option key={count} value={count}>{count} Traveler{count > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <select
                      value={formData.travelClass}
                      onChange={(e) => setFormData((prev) => ({ ...prev, travelClass: e.target.value }))}
                      className="w-full px-4 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                    >
                      <option>Economy</option>
                      <option>Premium Economy</option>
                      <option>Business</option>
                      <option>First Class</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {multiCitySegments.map((segment, index) => (
                  <div key={`segment-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative">
                    <div className="md:col-span-4 space-y-2 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Leg {index + 1} From</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                        <input
                          type="text"
                          placeholder="From city"
                          value={segment.from}
                          onChange={(e) => {
                            updateMultiCitySegment(index, 'from', e.target.value);
                            openSuggestions(e.target.value, `multi-${index}-from`);
                          }}
                          onFocus={() => openSuggestions(segment.from, `multi-${index}-from`)}
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                        />
                      </div>
                      {renderSuggestions(`multi-${index}-from`)}
                    </div>

                    <div className="md:col-span-4 space-y-2 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Leg {index + 1} To</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                        <input
                          type="text"
                          placeholder="To city"
                          value={segment.to}
                          onChange={(e) => {
                            updateMultiCitySegment(index, 'to', e.target.value);
                            openSuggestions(e.target.value, `multi-${index}-to`);
                          }}
                          onFocus={() => openSuggestions(segment.to, `multi-${index}-to`)}
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                        />
                      </div>
                      {renderSuggestions(`multi-${index}-to`)}
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Departure</label>
                      <input
                        type="date"
                        min={index === 0 ? todayISO : multiCitySegments[index - 1]?.date || todayISO}
                        value={segment.date}
                        onChange={(e) => updateMultiCitySegment(index, 'date', e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-center justify-center pb-2">
                      <button
                        type="button"
                        onClick={() => removeMultiCitySegment(index)}
                        disabled={multiCitySegments.length <= 2}
                        className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove leg"
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={addMultiCitySegment}
                    disabled={multiCitySegments.length >= 5}
                    className="px-5 py-2.5 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Add Another Leg
                  </button>

                  <div className="flex-1 min-w-[260px] grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                      <select
                        value={formData.travelers}
                        onChange={(e) => setFormData((prev) => ({ ...prev, travelers: Number(e.target.value) }))}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((count) => (
                          <option key={count} value={count}>{count} Traveler{count > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

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
              </div>
            )}

            {validationError && (
              <p className="text-[11px] font-black uppercase tracking-wider text-red-500">{validationError}</p>
            )}

            <div className="flex justify-end">
              <button type="submit" className="w-full md:w-auto px-10 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 flex items-center justify-center gap-3">
                <Search className="w-4 h-4" />
                Search Flights
              </button>
            </div>
          </form>
        </div>

        <div className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Partner Airlines</h2>
            <div className="flex-1 h-[1px] bg-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {['Air India', 'IndiGo', 'Vistara', 'SpiceJet', 'Qatar Airways', 'Singapore Airlines'].map((airline, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{airline}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, title: 'Safe Travels', desc: 'Comprehensive health and safety protocols across all partner airlines.' },
            { icon: <Users className="w-8 h-8 text-indigo-600" />, title: 'Flexible Planning', desc: 'One-way, round-trip, and multi-city searches with connected itineraries.' },
            { icon: <Search className="w-8 h-8 text-indigo-600" />, title: 'Instant Booking', desc: 'One-click checkout and immediate e-ticket generation for all routes.' }
          ].map((feature, i) => (
            <div key={i} className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
                {feature.icon}
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">{feature.title}</h4>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flights;
