/**
 * This file is used to import and reference modules with side effects
 * that would otherwise be stripped out by the bundler.
 */

import { Tab } from 'bootstrap';

const sideEffects = {
  bootstrap: { Tab },
};

export default sideEffects;
