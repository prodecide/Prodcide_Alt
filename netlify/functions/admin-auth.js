import handler from '../../api/admin-auth.js';
import { wrap } from '../lib/adapter.js';

export default wrap(handler);
