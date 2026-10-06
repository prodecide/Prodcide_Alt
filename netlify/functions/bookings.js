import handler from '../../api/bookings.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
