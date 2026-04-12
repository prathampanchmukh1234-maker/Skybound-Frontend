import { CONCERTS, SHOWTIMES, THEATERS } from '../constants';
import { Booking } from '../types';

const QR_MATRIX_SIZE = 29;

const parseDisplayDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatBookingDate = (booking: Booking) => {
  const parsed = parseDisplayDate(booking.travel_date || booking.created_at || booking.date);
  if (!parsed) return booking.travel_date || booking.created_at || booking.date || 'TBA';

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getBookingVenueInfo = (booking: Booking) => {
  const fallbackRoute = booking.from_city && booking.to_city ? `${booking.from_city} → ${booking.to_city}` : null;
  const details = (booking.details || {}) as Record<string, any>;
  const movieShowtimeId = (booking as any).item_id || booking.itemId || details.showtimeId || details.showtime_id;
  const concertId = (booking as any).item_id || booking.itemId;
  const matchedShowtime = booking.type === 'movie'
    ? SHOWTIMES.find((showtime) => showtime.id === movieShowtimeId)
    : null;
  const matchedConcert = booking.type === 'concert'
    ? CONCERTS.find((concert) => concert.id === concertId)
    : null;
  const matchedMovieTheater = matchedShowtime
    ? THEATERS.find((theater) => theater.id === matchedShowtime.theaterId)
    : null;
  const rawVenue = booking.venue || matchedConcert?.venue || details.venue || details.location || fallbackRoute || null;

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const normalizedVenue = rawVenue ? normalize(rawVenue) : '';

  const matchedTheater = rawVenue
    ? THEATERS.find((theater) => {
        const normalizedTheaterName = normalize(theater.name);
        return (
          rawVenue === theater.name ||
          rawVenue.startsWith(`${theater.name},`) ||
          normalizedVenue === normalizedTheaterName ||
          normalizedVenue.includes(normalizedTheaterName) ||
          normalizedTheaterName.includes(normalizedVenue)
        );
      })
    : null;

  return {
    venueName: matchedMovieTheater?.name || matchedTheater?.name || rawVenue,
    location: matchedMovieTheater?.location || matchedTheater?.location || matchedConcert?.venue?.split(',').slice(1).join(',').trim() || details.location || null,
    summary: (matchedMovieTheater?.location || matchedTheater?.location || matchedConcert?.venue)
      ? `${(matchedMovieTheater?.name || matchedTheater?.name || matchedConcert?.venue?.split(',')[0]?.trim() || rawVenue)} • ${(matchedMovieTheater?.location || matchedTheater?.location || matchedConcert?.venue?.split(',').slice(1).join(',').trim())}`
      : rawVenue
  };
};

export const getBookingDisplayTime = (booking: Booking) => {
  const details = (booking.details || {}) as Record<string, any>;
  const movieShowtimeId = (booking as any).item_id || booking.itemId || details.showtimeId || details.showtime_id;
  const concertId = (booking as any).item_id || booking.itemId;
  const matchedShowtime = booking.type === 'movie'
    ? SHOWTIMES.find((showtime) => showtime.id === movieShowtimeId)
    : null;
  const matchedConcert = booking.type === 'concert'
    ? CONCERTS.find((concert) => concert.id === concertId)
    : null;

  return (
    matchedShowtime?.time ||
    matchedConcert?.time ||
    booking.show_time ||
    details.show_time ||
    details.time ||
    details.slot ||
    details.departure ||
    details.departureTime ||
    null
  );
};

export const getBookingExperienceDisplay = (booking: Booking) => {
  const details = (booking.details || {}) as Record<string, any>;
  const movieShowtimeId = (booking as any).item_id || booking.itemId || details.showtimeId || details.showtime_id;
  const matchedShowtime = booking.type === 'movie'
    ? SHOWTIMES.find((showtime) => showtime.id === movieShowtimeId)
    : null;

  const format = matchedShowtime?.format || details.format || null;
  const screen = matchedShowtime?.screen || details.screen || null;

  if (format && screen && format !== screen) {
    return `${format} • ${screen}`;
  }

  return format || screen || null;
};

const createEmptyMatrix = () =>
  Array.from({ length: QR_MATRIX_SIZE }, () => Array.from({ length: QR_MATRIX_SIZE }, () => false));

const createReservedMatrix = () =>
  Array.from({ length: QR_MATRIX_SIZE }, () => Array.from({ length: QR_MATRIX_SIZE }, () => false));

const drawFinder = (matrix: boolean[][], reserved: boolean[][], row: number, col: number) => {
  for (let r = 0; r < 7; r += 1) {
    for (let c = 0; c < 7; c += 1) {
      const currentRow = row + r;
      const currentCol = col + c;
      reserved[currentRow][currentCol] = true;

      const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      matrix[currentRow][currentCol] = isOuter || isInner;
    }
  }
};

const drawTimingPatterns = (matrix: boolean[][], reserved: boolean[][]) => {
  for (let index = 8; index < QR_MATRIX_SIZE - 8; index += 1) {
    const value = index % 2 === 0;
    matrix[6][index] = value;
    matrix[index][6] = value;
    reserved[6][index] = true;
    reserved[index][6] = true;
  }
};

const createSeed = (value: string) => {
  let seed = 0;

  for (let index = 0; index < value.length; index += 1) {
    seed = (seed * 31 + value.charCodeAt(index)) >>> 0;
  }

  return seed || 0x1f123bb5;
};

const nextBit = (seedRef: { current: number }) => {
  let x = seedRef.current || 0x1f123bb5;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  seedRef.current = x >>> 0;
  return (seedRef.current & 1) === 1;
};

const buildVerificationMatrix = (value: string) => {
  const matrix = createEmptyMatrix();
  const reserved = createReservedMatrix();
  const seedRef = { current: createSeed(value) };

  drawFinder(matrix, reserved, 0, 0);
  drawFinder(matrix, reserved, 0, QR_MATRIX_SIZE - 7);
  drawFinder(matrix, reserved, QR_MATRIX_SIZE - 7, 0);
  drawTimingPatterns(matrix, reserved);

  for (let row = 0; row < QR_MATRIX_SIZE; row += 1) {
    for (let col = 0; col < QR_MATRIX_SIZE; col += 1) {
      if (reserved[row][col]) continue;
      matrix[row][col] = nextBit(seedRef);
    }
  }

  return matrix;
};

export const buildTicketVerificationDataUri = (booking: Booking, userName?: string) => {
  const payload = [
    booking.id,
    booking.title || booking.type,
    getBookingVenueInfo(booking).summary || 'SykBound',
    formatBookingDate(booking),
    booking.show_time || 'Anytime',
    Array.isArray(booking.seat) ? booking.seat.join(', ') : booking.seat || 'Standard',
    userName || 'Guest'
  ].join('|');

  const matrix = buildVerificationMatrix(payload);
  const cellSize = 8;
  const quietZone = 16;
  const totalSize = QR_MATRIX_SIZE * cellSize + quietZone * 2;

  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return '';
  }

  canvas.width = totalSize;
  canvas.height = totalSize;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, totalSize, totalSize);

  context.fillStyle = '#0f172a';

  matrix.forEach((row, rowIndex) => {
    row.forEach((filled, colIndex) => {
      if (!filled) return;

      context.fillRect(
        quietZone + colIndex * cellSize,
        quietZone + rowIndex * cellSize,
        cellSize,
        cellSize
      );
    });
  });

  return canvas.toDataURL('image/png');
};
