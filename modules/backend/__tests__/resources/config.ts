import path from 'path';
import { loadConfig } from '../../src/config.js';

const config = loadConfig(path.join(__dirname, '.env.test'));
export default config;
