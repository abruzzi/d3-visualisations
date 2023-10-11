import data from './heat.json';
import {createGraph} from './heat';

const result = createGraph(data, 'canvas');
console.log(result);