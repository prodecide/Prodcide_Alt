import handler from '../../api/reviews.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
