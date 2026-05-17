/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LifecycleStage {
  EXPLORATION = 'exploration',
  APPRAISAL = 'appraisal',
  RESERVOIR = 'reservoir',
  RESERVES = 'reserves',
  DRILLING = 'drilling',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  ANALYTICS = 'analytics',
  LIBRARY = 'library',
  UNCONVENTIONAL = 'unconventional',
  ASSET_MANAGEMENT = 'asset_management',
  LEASING = 'leasing',
  ECONOMICS = 'economics',
  CCUS = 'ccus',
  ECON_ADV = 'econ_adv',
  SURVEYING = 'surveying',
  DRILLING_ADV = 'drilling_adv',
  GEOPHYSICS_ADV = 'geophysics_adv',
  GEOMECHANICS_ADV = 'geomechanics_adv',
  UNCONVENTIONAL_ADV = 'unconventional_adv',
  OFFSHORE_ADV = 'offshore_adv',
  PIPELINE_ADV = 'pipeline_adv',
  HSE_ADV = 'hse_adv',
  GEOCHEMISTRY_ADV = 'geochemistry_adv',
  WATER_ADV = 'water_adv',
  DIGITAL_ADV = 'digital_adv',
  PROJECT_ADV = 'project_adv',
  REFINING_ADV = 'refining_adv',
  GEOLOGY_ADV = 'geology_adv',
  CORROSION_ADV = 'corrosion_adv',
  METERING_ADV = 'metering_adv',
  DRILLING_AI_ADV = 'drilling_ai_adv',
  RETAIL = 'retail',
  MIDSTREAM = 'midstream',
  DISTRIBUTION = 'distribution',
  SETTINGS = 'settings'
}

export interface Composition {
  component: string;
  moleFraction: number;
  criticalTemp: number; // K
  criticalPress: number; // bar
  acentricFactor: number;
}

export interface PVTInput {
  temp: number; // C
  press: number; // bar
  composition: Composition[];
}

export interface ReserveEstimation {
  method: 'volumetric' | 'material-balance';
  ooip: number;
  giip: number;
  recoverable: number;
  recoveryFactor: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  currentStage: LifecycleStage;
  data: {
    reservoir?: any;
    production?: any[];
    pvt?: any;
    drilling?: any;
  };
}