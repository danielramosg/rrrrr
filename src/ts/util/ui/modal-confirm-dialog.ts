import { Modal } from 'bootstrap';

import { guardedQuerySelector } from '../guarded-query-selectors';

type ConfirmDialogElements = Readonly<{
  modalDialogElement: HTMLElement;
  modalDialogTitleElement: HTMLElement;
  modalDialogBodyElement: HTMLElement;
  modelDialogCloseButton: HTMLButtonElement;
  modelDialogOkButton: HTMLButtonElement;
  modelDialogCancelButton: HTMLButtonElement;
}>;

class ModalConfirmDialog {
  static readonly defaultTitleText = 'Confirmation required';

  protected static singletonInstance: ModalConfirmDialog | null = null;

  protected currentOpenPromise: Promise<boolean> = Promise.resolve(false);

  // eslint-disable-next-line class-methods-use-this
  protected resolver: (result: boolean) => void = () => {};

  protected modalDialog: Modal;

  protected isConfirmed: boolean = false;

  protected elements: ConfirmDialogElements;

  protected constructor() {
    this.elements = ModalConfirmDialog.queryElements();
    this.modalDialog = new Modal(this.elements.modalDialogElement, {
      backdrop: 'static',
    });

    const confirm = this.confirm.bind(this);
    const dismiss = this.dismiss.bind(this);
    this.elements.modelDialogCloseButton.addEventListener('click', dismiss);
    this.elements.modelDialogOkButton.addEventListener('click', confirm);
    this.elements.modelDialogCancelButton.addEventListener('click', dismiss);
    this.elements.modalDialogElement.addEventListener('hidden.bs.modal', () => {
      this.resolver(this.isConfirmed);
    });
  }

  protected static queryElements(): ConfirmDialogElements {
    const modalDialogElement = guardedQuerySelector(HTMLElement, '#modal');
    const qs = <T extends Element>(
      type: { new (...args: unknown[]): T },
      query: string,
    ) => guardedQuerySelector(type, query, modalDialogElement);
    const modalDialogTitleElement = qs(HTMLElement, '.modal-title');
    const modalDialogBodyElement = qs(HTMLElement, '.modal-body');
    const modelDialogCloseButton = qs(
      HTMLButtonElement,
      '.modal-header button.btn-close',
    );
    const modelDialogOkButton = qs(
      HTMLButtonElement,
      '.modal-footer button.btn-primary',
    );
    const modelDialogCancelButton = qs(
      HTMLButtonElement,
      '.modal-footer button.btn-secondary',
    );

    return {
      modalDialogElement,
      modalDialogTitleElement,
      modalDialogBodyElement,
      modelDialogCloseButton,
      modelDialogOkButton,
      modelDialogCancelButton,
    };
  }

  protected confirm() {
    this.isConfirmed = true;
  }

  protected dismiss() {
    this.isConfirmed = false;
  }

  async open(
    text: string,
    title: string = ModalConfirmDialog.defaultTitleText,
  ): Promise<boolean> {
    await this.currentOpenPromise;
    const { modalDialogTitleElement, modalDialogBodyElement } = this.elements;
    this.currentOpenPromise = new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      modalDialogTitleElement.textContent = title;
      modalDialogBodyElement.textContent = text;
      this.modalDialog.show();
    });
    return this.currentOpenPromise;
  }

  static instance(): ModalConfirmDialog {
    if (ModalConfirmDialog.singletonInstance === null) {
      ModalConfirmDialog.singletonInstance = new ModalConfirmDialog();
    }
    return ModalConfirmDialog.singletonInstance;
  }
}

export default ModalConfirmDialog;
export { ModalConfirmDialog };
