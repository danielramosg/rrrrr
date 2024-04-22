/**
 * This file is used to import and reference modules with side effects
 * that would otherwise be stripped out by the bundler.
 */

import { Tab } from 'bootstrap';
import '@fontsource/jost/latin-500.css'; // Medium weight
import '@fontsource/jost/latin-700.css'; // Bold weight

const sideEffects = {
  bootstrap: { Tab },
};

export default sideEffects;
