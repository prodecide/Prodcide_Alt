import handler from '../../api/user-profiles.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
