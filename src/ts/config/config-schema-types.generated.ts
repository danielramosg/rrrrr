/* tslint:disable */
/* eslint-disable */
/**
 * This file is generated by core-types-ts on behalf of typeconv, DO NOT EDIT.
 * For more information, see:
 *  - {@link https://github.com/grantila/core-types-ts}
 *  - {@link https://github.com/grantila/typeconv}
 */

export interface InitialParameters {
  abandonExcessRate: number;
  abandonRate: number;
  acquireRate: number;
  breakRate: number;
  capacityAdjustmentRate: number;
  disposeIncentive: number;
  disposeRate: number;
  landfillIncentive: number;
  landfillRate: number;
  naturalResourcesIncentive: number;
  newPhoneProductionRate: number;
  newlyProducedPhoneIncentive: number;
  numberOfUsers: number;
  phonesPerUserGoal: number;
  recycleRate: number;
  recyclingIncentive: number;
  refurbishmentIncentive: number;
  refurbishmentRate: number;
  repairIncentive: number;
  repairRate: number;
  reuseIncentive: number;
}

export interface InitialStocks {
  capacityOfNewlyProducedPhones: number;
  capacityOfRecycledMaterials: number;
  capacityOfRefurbishedPhones: number;
  capacityOfRepairedPhones: number;
  phonesInUse: number;
  supplyOfBrokenPhones: number;
  supplyOfDisposedPhones: number;
  supplyOfHibernatingPhones: number;
  supplyOfNewlyProducedPhones: number;
  supplyOfRecycledMaterials: number;
  supplyOfRefurbishedPhones: number;
  supplyOfRepairedPhones: number;
}

export interface ParameterTransform {
  id: string;
  script: string;
}

export interface BasicSlot {
  id: string;
  x: number;
  y: number;
  angle?: number;
}

export interface BasicSlotGroup {
  id: string;
  type: 'basic';
  slots: BasicSlot[];
  parameterTransformIds: string[];
}

export interface SlotWithCard {
  id: string;
  x: number;
  y: number;
  angle?: number;
  card: {
    x: number;
    y: number;
    angle?: number;
  };
}

export interface I18NString {
  [key: string]: string;
}

export interface ActionCard {
  id: string;
  url: string;
  title: I18NString;
  description: I18NString;
}

export interface ActionCardSlotGroup {
  id: string;
  type: 'action-card';
  slots: SlotWithCard[];
  cards: ActionCard[];
}

export interface EventCard {
  id: string;
  url: string;
  title: I18NString;
  description: I18NString;
}

export interface EventCardSlotGroup {
  id: string;
  type: 'event-card';
  slots: SlotWithCard[];
  cards: EventCard[];
}

export type SlotGroup =
  | BasicSlotGroup
  | ActionCardSlotGroup
  | EventCardSlotGroup;

export interface TriggerCondition {
  condition: string;
  url: string;
}

export interface Trigger {
  id: string;
  events: TriggerCondition[];
}

export interface Config {
  general: {
    backgroundImage: string;
  };
  model: {
    initialParameters: InitialParameters;
    initialStocks: InitialStocks;
  };
  simulation: {
    deltaPerSecond: number;
    maxStepSize: number;
  };
  parameterTransforms: ParameterTransform[];
  interaction: {
    slotActivationDelay: number;
    slotDeactivationDelay: number;
    slotGroups: SlotGroup[];
  };
  triggers: Trigger[];
}
