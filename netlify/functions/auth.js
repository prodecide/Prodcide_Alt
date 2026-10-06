import handler from '../../api/auth.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
