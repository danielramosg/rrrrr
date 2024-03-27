/**
 * This file needs a proper refactor. The control panel was created in a short amount of time for a demo workshop.
 * Initially, it was not supposed to stay in the app, but has survived as a valuable tool for experimentation.
 */
import { EventEmitter } from 'events';
import type TypedEmitter from 'typed-emitter';
import Sortable from 'sortablejs';
import { strict as assert } from 'assert';

import {
  type ParameterIds,
  type Parameters,
  parameterIds,
} from './circular-economy-model';

import {
  guardedQuerySelector,
  guardedQuerySelectorAll,
} from './util/guarded-query-selectors';
import { ScriptedParameterTransform } from './parameter-transform/scripted-parameter-transform';
import type {
  ReadonlyConfig,
  ParameterTransformConfig,
} from './config/config-schema';
import { ignorePromise } from './util/ignore-promise';

type CircularEconomyScriptParameterTransform =
  ScriptedParameterTransform<ParameterIds>;

type ControlPanelElements = Readonly<{
  availableParameterTransformsContainer: HTMLDivElement;
  activeParameterTransformsContainer: HTMLDivElement;
  idElement: HTMLInputElement;
  scriptElement: HTMLTextAreaElement;
  clearAllActiveParameterTransformsButton: HTMLElement;
  addParameterTransformButton: HTMLElement;
  deleteParameterTransformButton: HTMLElement;
  importExportElement: HTMLTextAreaElement;
  exportButton: HTMLInputElement;
  importButton: HTMLInputElement;
}>;

type ControlPanelEvents = {
  'play': () => void;
  'pause': () => void;
  'update-parameters': (parameters: Parameters) => void;
};

class ControlPanel {
  readonly events: TypedEmitter<ControlPanelEvents> =
    new EventEmitter() as TypedEmitter<ControlPanelEvents>;

  readonly elements: ControlPanelElements;

  readonly config: ReadonlyConfig;

  readonly parameterTransforms: {
    create: (id: string, script: string) => void;
    destroy: (id: string) => void;
    clear: () => void;
  };

  readonly updateParameters: () => void;

  constructor(config: ReadonlyConfig) {
    this.config = config;
    const confirm = async (
      message: string,
      title?: string,
    ): Promise<boolean> => {
      /* eslint-disable */ // FIXME: Something is wrong with Vue component types
      const { app } = await window.circularEconomy;
      return await app.openConfirmDialog(message, title);
    };

    this.elements = ControlPanel.queryElements();
    const {
      availableParameterTransformsContainer,
      activeParameterTransformsContainer,
      idElement,
      scriptElement,
      clearAllActiveParameterTransformsButton,
      addParameterTransformButton,
      deleteParameterTransformButton,
      importExportElement,
      exportButton,
      importButton,
    } = this.elements;

    const initialParameters = { ...config.model.initialParameters };
    const availableParameterTransforms = new Map<
      string,
      CircularEconomyScriptParameterTransform
    >();

    function getDistinctParameters(
      p1: Parameters,
      p2: Parameters,
    ): Partial<Parameters> {
      const result: Partial<Parameters> = {};
      parameterIds.forEach((id) => {
        if (p1[id] !== p2[id]) {
          result[id] = p2[id];
        }
      });
      return result;
    }

    this.updateParameters = () => {
      const parameters = { ...initialParameters };
      [...activeParameterTransformsContainer.children].forEach((e) => {
        assert(e instanceof HTMLElement);
        const id = e.getAttribute('data-id');
        assert(id !== null);
        const parameterTransform = availableParameterTransforms.get(id);
        assert(parameterTransform !== undefined);
        const backupParameters = { ...parameters };
        parameterTransform.applyTo(parameters);
        const distinctParameters = getDistinctParameters(
          backupParameters,
          parameters,
        );
        e.title = `${parameterTransform.script}\n\n${JSON.stringify(
          distinctParameters,
          null,
          2,
        )}\n\n${JSON.stringify(parameters, null, 2)}`;
      });
      this.events.emit('update-parameters', parameters);
    };

    Sortable.create(this.elements.availableParameterTransformsContainer, {
      group: {
        name: 'sharedParameterTransforms',
        pull: 'clone',
        put: false, // Do not allow items to be put into this list
      },
      onClone: (evt) => {
        const cloneElement = evt.clone;
        const { id } = cloneElement.dataset;
        assert(id !== undefined);
        cloneElement.addEventListener('click', () => {
          const parameterTransform = availableParameterTransforms.get(id);
          assert(parameterTransform !== undefined);
          idElement.value = id;
          scriptElement.value = parameterTransform.script;
        });
      },
    });
    Sortable.create(this.elements.activeParameterTransformsContainer, {
      group: { name: 'sharedParameterTransforms' },
      removeOnSpill: true,
      onEnd: this.updateParameters.bind(this),
      onAdd: this.updateParameters.bind(this),
    });

    this.parameterTransforms = {
      create: (id: string, script: string) => {
        const exists = availableParameterTransforms.has(id);
        availableParameterTransforms.set(
          id,
          new ScriptedParameterTransform<ParameterIds>(
            'none',
            parameterIds,
            script,
          ),
        );
        if (exists) {
          this.updateParameters();
        } else {
          const parameterTransformElement = document.createElement('div');
          parameterTransformElement.classList.add('parameter-transform');
          parameterTransformElement.setAttribute('data-id', id);
          parameterTransformElement.innerText = id;
          parameterTransformElement.addEventListener('click', () => {
            const parameterTransform = availableParameterTransforms.get(id);
            assert(parameterTransform !== undefined);
            idElement.value = id;
            scriptElement.value = parameterTransform.script;
          });
          availableParameterTransformsContainer.append(
            parameterTransformElement,
          );
        }
      },
      destroy: (id: string) => {
        availableParameterTransforms.delete(id);
        guardedQuerySelector(
          HTMLElement,
          `[data-id="${id}"]`,
          availableParameterTransformsContainer,
        ).remove();
        guardedQuerySelectorAll(
          HTMLElement,
          `[data-id="${id}"]`,
          activeParameterTransformsContainer,
        ).forEach((element) => element.remove());
        this.updateParameters();
      },
      clear: () => {
        availableParameterTransforms.clear();
        availableParameterTransformsContainer.innerHTML = '';
        activeParameterTransformsContainer.innerHTML = '';
        this.updateParameters();
      },
    };

    clearAllActiveParameterTransformsButton.addEventListener('click', () => {
      ignorePromise(
        (async () => {
          const message =
            'Do you really want to clear all active parameter transformations?';
          if (await confirm(message)) {
            activeParameterTransformsContainer.innerHTML = '';
            this.updateParameters();
          }
        })(),
      );
    });

    addParameterTransformButton.addEventListener('click', () =>
      ignorePromise(
        (async () => {
          const id = idElement.value;
          const script = scriptElement.value;
          const exists = availableParameterTransforms.has(id);
          let confirmed = true;
          if (exists) {
            const message = `Do you really want to update the definition of the parameter transformation "${id}"? This will also update all active instances of this parameter transformation.`;
            confirmed = await confirm(message);
          }
          if (confirmed) this.parameterTransforms.create(id, script);
        })(),
      ),
    );

    deleteParameterTransformButton.addEventListener('click', () =>
      ignorePromise(
        (async () => {
          const id = idElement.value;
          const message = `Do you really want to delete the parameter transformation "${id}"? This will also delete all active instances of this parameter transformation.`;
          if (await confirm(message)) {
            this.parameterTransforms.destroy(id);
          }
        })(),
      ),
    );

    config.parameterTransforms.forEach(({ id, script }) =>
      this.parameterTransforms.create(id, script),
    );

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    importButton.addEventListener('click', async () => {
      const text = importExportElement.value;
      const data = JSON.parse(text) as ParameterTransformConfig[]; // TODO: Validate input
      const message =
        'Are you sure you want to import the parameter transformations? This will clear all existing parameter transformations.';
      if (await confirm(message)) {
        this.parameterTransforms.clear();
        data.forEach(({ id, script }) =>
          this.parameterTransforms.create(id, script),
        );
      }
    });

    exportButton.addEventListener('click', () => {
      const data = [...availableParameterTransforms.entries()].map(
        ([id, parameterTransform]) => ({
          id,
          script: parameterTransform.script,
        }),
      );
      importExportElement.value = JSON.stringify(data, null, 2);
    });
  }

  activateParameterTransform(id: string) {
    const parameterTransformElement = guardedQuerySelector(
      HTMLElement,
      `[data-id="${id}"]`,
      this.elements.availableParameterTransformsContainer,
    );
    this.elements.activeParameterTransformsContainer.append(
      parameterTransformElement.cloneNode(true),
    );
    this.updateParameters();
  }

  deactivateParameterTransform(id: string) {
    const parameterTransformElement = guardedQuerySelector(
      HTMLElement,
      `[data-id="${id}"]`,
      this.elements.activeParameterTransformsContainer,
    );
    parameterTransformElement.remove();
    this.updateParameters();
  }

  protected static queryElements(): ControlPanelElements {
    const availableParameterTransformsContainer = guardedQuerySelector(
      HTMLDivElement,
      '#parameter-transforms .available',
    );
    const activeParameterTransformsContainer = guardedQuerySelector(
      HTMLDivElement,
      '#parameter-transforms .active',
    );

    const idElement = guardedQuerySelector(
      HTMLInputElement,
      '#parameter-transform-id',
    );
    const scriptElement = guardedQuerySelector(
      HTMLTextAreaElement,
      '#parameter-transform-script',
    );

    const clearAllActiveParameterTransformsButton = guardedQuerySelector(
      HTMLElement,
      '#clear-all-active-parameter-transforms-button',
    );
    const addParameterTransformButton = guardedQuerySelector(
      HTMLElement,
      '#add-parameter-transform',
    );

    const deleteParameterTransformButton = guardedQuerySelector(
      HTMLElement,
      '#delete-parameter-transform',
    );

    const importExportElement = guardedQuerySelector(
      HTMLTextAreaElement,
      '#import-export',
    );
    const exportButton = guardedQuerySelector(
      HTMLInputElement,
      '#export-button',
    );

    const importButton = guardedQuerySelector(
      HTMLInputElement,
      '#import-button',
    );

    return {
      availableParameterTransformsContainer,
      activeParameterTransformsContainer,
      idElement,
      scriptElement,
      clearAllActiveParameterTransformsButton,
      addParameterTransformButton,
      deleteParameterTransformButton,
      importExportElement,
      exportButton,
      importButton,
    };
  }
}

export { ControlPanel };
export type { ControlPanelEvents };
