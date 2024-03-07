/**
 * The osc.js library specifies an implementation targeting Node.js per default.
 * The implementation that targets Browsers is located in the file 'osc/dist/osc-browser.js'.
 * This file just re-exports this module such that we don't put this internal knowledge into the rest of the code.
 */
import * as osc from 'osc/dist/osc-browser';

export default osc;
export * from 'osc/dist/osc-browser';
