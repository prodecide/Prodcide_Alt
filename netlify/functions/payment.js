import handler from '../../api/payment.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
