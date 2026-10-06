import handler from '../../api/users.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
