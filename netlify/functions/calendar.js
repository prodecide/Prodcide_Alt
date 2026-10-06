import handler from '../../api/calendar.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
