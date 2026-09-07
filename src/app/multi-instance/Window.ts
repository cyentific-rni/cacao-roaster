import { Playbook } from '../../../lib/cacao2-js/src/Playbook';
import type MultiInstanceApplication from './MultiInstanceApplication';
import CacaoEditor from '../../diagram/CacaoEditor';
import { newPlaybook } from '../Application';
import UserSettingsProps from '../UserSettingsProps';
import cacaoDialog from '../../diagram/modules/core/CacaoDialog';
import type { ExecutionStatus } from '../../../src/diagram/modules/model/status/status-model/ExecutionStatus';

export default class CacaoWindow {
	private _headerEntry: HTMLElement;
	private _headerEntryTextElement!: HTMLElement;
	private _headerEntryTlpIndicator!: HTMLElement;
	private _app: MultiInstanceApplication;
	private _editor!: CacaoEditor;
	private _container: HTMLElement;
	static $inject: string[];

	constructor(app: MultiInstanceApplication) {
		this._container = document.createElement('div');
		this._container.id = 'cacaoWindow';
		this._app = app;
		this._headerEntry = this.createHeaderEntry();
		this.initPage();
	}

	get headerTabEntry() {
		return this._headerEntry;
	}

	get container() {
		return this._container;
	}

	show() {
		this._headerEntry.classList.add('tab-open');
		this._app.currentWindow = this._container;
	}

	hide() {
		this._headerEntry.classList.remove('tab-open');
		this._closeLogWindow();
	}

	/* Closes the log window by removing the 'show' class and adding the 'hide' class.
	 */
	private _closeLogWindow() {
		const logWindowUuid = this._editor?.playbookHandler?.getIntegrationLog().uuid;
		const logWindow = document.getElementById(`logWindow-${logWindowUuid}`);
		if (logWindow) {
			logWindow.classList.remove('show');
			logWindow.classList.add('hide');
		}
	}

	private initPage() {
		const logo = document.createElement('div');
		logo.className = 'window__logo';

		const complianceBadge = document.createElement('div');
		complianceBadge.className = 'window__compliance-badge';
		complianceBadge.textContent = 'CACAO v2 compliant';

		const primaryButtonContainer = document.createElement('div');
		primaryButtonContainer.className = 'window__buttoncontainer';

		// Button for creating a new CACAO playbook.
		const newButton = document.createElement('div');
		newButton.className = 'window__button button--new button--big';
		newButton.innerHTML = `
        <div class="button__icon"></div>
        <p class="button__label">Create</p>
        `;
		newButton.onclick = () => {
			this.openPlaybookInNewTab(newPlaybook());
		};

		// Button for uploading a CACAO JSON file from local machine.
		const openButton = document.createElement('div');
		openButton.className = 'window__button button--open button--big';
		openButton.innerHTML = `
        <div class="button__icon"></div>
        <p class="button__label">Import File</p>
        `;
		openButton.onclick = () => {
			try {
				this.openFileExplorer();
			} catch (e: any) {
				cacaoDialog.showAlert('Error when trying to import a file', e.message);
			}
		};

		// Button for importing CACAO playbook in text format.
		const textImport = document.createElement('div');
		textImport.className = 'window__button button--paste button--big';
		textImport.innerHTML = `
        <div class="button__icon"></div>
        <p class="button__label">Import Text</p>
        `;
		textImport.onclick = () => this.openDialogForTextImport();

		const settingsButton = document.createElement('div');
		settingsButton.className = 'window__button button--settings button--small button--wholerow';
		settingsButton.innerHTML = `
        <div class="button__icon"></div>
        <p class="button__label">user settings</p>
        `;
		settingsButton.onclick = () => {
			UserSettingsProps.instance.showDialog();
		};

		this._container.appendChild(logo);
		primaryButtonContainer.appendChild(newButton);
		primaryButtonContainer.appendChild(openButton);
		primaryButtonContainer.appendChild(textImport);
		this._container.appendChild(complianceBadge);
		this._container.appendChild(primaryButtonContainer);
		this._container.appendChild(settingsButton);
		this._container.className = 'picker-window';
	}

	private openDialogForTextImport(): void {
		const dialog = document.createElement('dialog') as HTMLDialogElement;
		dialog.className = 'dialog';
		dialog.addEventListener('keydown', event => {
			if (event.code.toLowerCase() === 'escape') {
				// remove the 'blurred' class from the body
				document.body.classList.remove('blurred');
			}
		});
		document.body.appendChild(dialog);

		// Create the title of the dialog
		const titleDialog = document.createElement('div') as HTMLDivElement;
		titleDialog.innerHTML = 'Import CACAO Playbook';
		titleDialog.className = 'dialog__title';
		dialog.appendChild(titleDialog);

		// Adding blur effect for the rest of the app, besides the dialog
		document.body.classList.add('blurred');

		// Creates the text area for the user to input the CACAO playbook
		const textArea = document.createElement('textarea') as HTMLTextAreaElement;
		textArea.classList.add('property__input', 'cacaoImportTextarea');
		textArea.placeholder = 'Paste the CACAO JSON here.';

		// Creates radio-buttons input with 3 options: 'Import text', 'import base64 encoded', 'import STIX 2.1 COA Playbook json'
		const radioButtonContainer = document.createElement('div') as HTMLDivElement;
		radioButtonContainer.className = 'dialog__radioButtonContainer';

		// Radio button for importing text
		const placeholderImportText = 'Paste the CACAO JSON here.';
		this.createImportRadioButton(
			radioButtonContainer,
			'CACAO JSON',
			placeholderImportText,
			textArea,
		);
		dialog.appendChild(radioButtonContainer);

		// Radio button for importing base64 encoded playbook
		const placeholderImportEncodedPlaybook = 'Paste the base64 encoded CACAO Playbook here.';
		this.createImportRadioButton(
			radioButtonContainer,
			'base64 encoded CACAO Playbook',
			placeholderImportEncodedPlaybook,
			textArea,
		);
		dialog.appendChild(radioButtonContainer);

		// Adds the text area to the dialog
		const textAreaContainer = document.createElement('div') as HTMLDivElement;
		textAreaContainer.className = 'dialog__property';
		textAreaContainer.appendChild(textArea);
		dialog.appendChild(textAreaContainer);

		// Creates the button for importing the playbook
		const importButton = document.createElement('button') as HTMLButtonElement;
		importButton.classList.add('dialog__buttonList', 'button--primary');
		importButton.innerHTML = 'Import';
		importButton.onclick = () => this.importPlaybookFromTextButtonHandler(textArea, dialog);

		// Creates the cancel button for the dialog
		const cancelButton = document.createElement('button');
		cancelButton.classList.add('dialog__buttonList', 'button--secondary');
		cancelButton.innerText = 'Cancel';
		cancelButton.onclick = () => {
			dialog.close();
			dialog.remove();
			document.body.classList.remove('blurred');
		};

		// Adds the import button to the dialog
		const buttonContainer = document.createElement('div') as HTMLDivElement;
		buttonContainer.className = 'dialog__buttonList';
		buttonContainer.appendChild(cancelButton);
		buttonContainer.appendChild(importButton);
		dialog.appendChild(buttonContainer);

		// Show the dialog
		dialog.showModal();
	}

	/* Creates a loading modal to show while importing a playbook
	 * @param message - The message to display with the loading spinner
	 * @returns Object with modal and backdrop elements
	 */
	private _createLoadingModal(message: string = 'Importing...'): { modal: HTMLElement, backdrop: HTMLElement } {
		// Create backdrop
		const backdrop = document.createElement('div');
		backdrop.className = 'loading-backdrop';
		
		// Create modal
		const modal = document.createElement('div');
		modal.className = 'loading-modal';
		modal.style.opacity = '1'; // Ensure opacity is set
		modal.style.transform = 'translate(-50%, -50%)'; // Ensure transform is set
		
		// Create spinner
		const spinner = document.createElement('div');
		spinner.className = 'loading-spinner';
		
		// Create text
		const text = document.createElement('div');
		text.className = 'loading-text';
		text.textContent = message;
		
		// Assemble elements
		modal.appendChild(spinner);
		modal.appendChild(text);
		
		// Add to document body for proper positioning
		document.body.appendChild(backdrop);
		document.body.appendChild(modal);
		
		// Force a reflow to ensure the animation runs
		void modal.offsetWidth;
		void backdrop.offsetWidth;
		
		// Add active class after the initial animation completes
		setTimeout(() => {
			if (modal && document.body.contains(modal)) {
				modal.classList.add('active');
			}
		}, 300);
		
		console.log('Loading modal created:', message, modal, backdrop);
		
		return { modal, backdrop };
	}

	/* Removes the loading modal with a fade-out animation
	 * @param elements - The modal and backdrop elements to remove
	 */
	private _removeLoadingModal(elements: { modal: HTMLElement, backdrop: HTMLElement }): void {
		console.log('Removing loading modal', elements);
		// Add fade-out class to both elements
		if (elements.modal) {
			elements.modal.style.opacity = '0';
			elements.modal.style.transform = 'translate(-50%, -50%) scale(0.95)';
		}
		if (elements.backdrop) {
			elements.backdrop.style.opacity = '0';
		}
		
		// Ensure no blur remains on the document body
		document.body.classList.remove('blurred');
		document.body.classList.remove('blur');
		document.body.style.filter = 'none';
		
		// Wait for animation to complete before removing from DOM
		setTimeout(() => {
			if (elements.modal && elements.modal.parentNode) {
				elements.modal.parentNode.removeChild(elements.modal);
			}
			if (elements.backdrop && elements.backdrop.parentNode) {
				elements.backdrop.parentNode.removeChild(elements.backdrop);
			}
			
			// Double-check that blur is removed after elements are gone
			document.body.classList.remove('blurred');
			document.body.classList.remove('blur');
			document.body.style.filter = 'none';
			
			console.log('Loading modal removed from DOM');
		}, 200); // Match this timing with CSS transition duration
	}

	/* Updates the loading modal message
	 * @param modal - The modal element
	 * @param message - The new message to display
	 */
	private _updateLoadingMessage(modal: HTMLElement, message: string): void {
		console.log('Updating loading message to:', message);
		const loadingText = modal.querySelector('.loading-text') as HTMLElement;
		if (loadingText) {
			// Force a reflow to ensure the animation and text change is visible
			loadingText.textContent = message;
			void loadingText.offsetWidth;
			
			// Briefly highlight the text change with a subtle animation
			loadingText.style.animation = 'none';
			setTimeout(() => {
				loadingText.style.animation = 'textUpdate 0.5s ease';
			}, 10);
		}
	}

	// Handler for the import button in the dialog for importing a CACAO playbook from text
	private importPlaybookFromTextButtonHandler(
		textArea: HTMLTextAreaElement,
		dialog: HTMLDialogElement,
	): void {
		// Get the input values before closing the dialog
		let playbook = textArea.value;
		
		// Check if text area is empty
		if (playbook === '') {
			cacaoDialog.showAlert('Error when trying to import the playbook', 'The text area is empty.');
			return;
		}

		// Check the value of the radio button
		const importOption = document.querySelector(
			'input[name="importOption"]:checked',
		) as HTMLInputElement;
		if (importOption === null) {
			cacaoDialog.showAlert('Error when trying to import the playbook', 'Please select an import option.');
			return;
		}
		
		// Store the import option value
		const importOptionValue = importOption.value;
		
		// Close the dialog first and ensure blur is removed
		document.body.classList.remove('blurred');
		// Also remove any other potential blur classes
		document.body.classList.remove('blur');
		document.body.style.filter = 'none';
		
		dialog.close();
		dialog.remove();
		
		// Now show the loading modal - after the dialog is closed
		const loadingElements = this._createLoadingModal('Processing playbook...');
		
		// Make sure loading elements have highest z-index
		if (loadingElements.modal && loadingElements.backdrop) {
			loadingElements.modal.style.zIndex = '100001';
			loadingElements.backdrop.style.zIndex = '100000';
		}
		
		// Process the playbook with staged updates for better user feedback
		const processPlaybook = async () => {
			try {
				// Stage 1: Process base64 if needed
				if (importOptionValue.includes('base64')) {
					// Allow UI to update before changing text
					await new Promise(resolve => setTimeout(resolve, 500));
					
					// Checks if the playbook is base64 encoded
					const base64Matcher =
						/^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{4})$/;
					if (!base64Matcher.test(playbook)) {
						this._removeLoadingModal(loadingElements);
						throw new Error('The playbook is not base64 encoded.');
					}
					
					// Update loading message
					this._updateLoadingMessage(loadingElements.modal, 'Decoding base64...');
					await new Promise(resolve => setTimeout(resolve, 500));
					
					// Decodes the base64 encoded playbook to plaintext
					playbook = Buffer.from(playbook, 'base64').toString('utf-8');
				}

				// Stage 2: Parse JSON
				this._updateLoadingMessage(loadingElements.modal, 'Parsing JSON...');
				await new Promise(resolve => setTimeout(resolve, 500));
				
				// Parses the plaintext to JSON format
				const playbookJson = JSON.parse(playbook);

				// STIX bundle detection
				if (playbookJson && playbookJson.type === 'bundle') {
					validateImportedStixBundle(playbookJson);
					const candidates = collectPlayboksFromStix(playbookJson);


					if (candidates.length === 1) {
						this.openPlaybookInNewTab(new Playbook(candidates[0].playbook));
						this._removeLoadingModal(loadingElements);
						return;
						}
						if (candidates.length > 1) {
						this.showMultiPlaybookDialog(candidates);
						this._removeLoadingModal(loadingElements);
						return;
					}

					this._removeLoadingModal(loadingElements);
					throw new Error('STIX bundle is valid, but it contains no embedded CACAO playbook');
				}
				
				// Stage 3: Import playbook
				this._updateLoadingMessage(loadingElements.modal, 'Importing playbook...');
				await new Promise(resolve => setTimeout(resolve, 500));
				
				// Checks if the JSON is a CACAO playbook and loads the editor
				if (isCacaoPlaybook(playbookJson)) {
					this.openPlaybookInNewTab(new Playbook(playbookJson));
					this._removeLoadingModal(loadingElements);
				} else {
					this._removeLoadingModal(loadingElements);
					throw new Error('The JSON imported is not a CACAO playbook');
				}
			} catch (e: any) {
				this._removeLoadingModal(loadingElements);
				cacaoDialog.showAlert('Error when trying to import the playbook', e.message);
			}
		};
		
		// Start the processing
		processPlaybook();
	}

	// Creates a radio button for importing a CACAO playbook in different formats
	private createImportRadioButton(
		radioButtonWrapper: HTMLDivElement,
		textContent: string,
		placeholderText: string,
		textArea: HTMLTextAreaElement,
	) {
		// Div for wrapping the label and the radio button
		const radioButtonAndLabel = document.createElement('div') as HTMLDivElement;
		radioButtonAndLabel.classList.add('dialog__property', 'radioButtonLabelContainer');

		// Creates the radio button
		const importTextRadio = document.createElement('input') as HTMLInputElement;
		importTextRadio.id = textContent.trim();
		importTextRadio.type = 'radio';
		importTextRadio.name = 'importOption';
		importTextRadio.value = textContent.trim();
		importTextRadio.textContent = textContent;
		importTextRadio.classList.add('radioButton');
		if (textContent === 'CACAO JSON') {
			importTextRadio.checked = true;
			// remove focus from the radio button
			importTextRadio.blur();
		}
		radioButtonAndLabel.appendChild(importTextRadio);

		// Creates the label for the radio button
		const importTextRadioLabel = document.createElement('label') as HTMLLabelElement;
		importTextRadioLabel.textContent = textContent;
		importTextRadioLabel.htmlFor = importTextRadio.id;
		radioButtonAndLabel.appendChild(importTextRadioLabel);

		// Adds the wrapping div to the radioButtonWrapper
		radioButtonWrapper.appendChild(radioButtonAndLabel);

		// Adds the event listener for the radio button to change the placeholder of the text area
		importTextRadio.addEventListener('change', () => {
			textArea.placeholder = placeholderText;
		});
	}

	private openFileExplorer(): void {
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = false;
		fileInput.accept = 'application/json';
		fileInput.addEventListener(
			'change',
			(event: Event) => {
				const input = event.target as HTMLInputElement;

				if (!input.files) {
					throw new Error('input.files undefined');
				}

				const file = input.files[0]; // Gets the first file selected

				if (!file) {
					throw new Error('file undefined');
				}

				if (fileIsJSON(file)) {
					// Ensure no blur effect is active
					document.body.classList.remove('blurred');
					document.body.classList.remove('blur');
					document.body.style.filter = 'none';
					
					// Find the openButton to update its visual state
					//check!
					const openButton = this._container.querySelector('.button--open') as HTMLElement | null;
					
					// Only disable the clicked button, not all buttons
					if (openButton) {
						(openButton as HTMLElement).classList.add('entry--disable');
						(openButton as HTMLElement).style.pointerEvents = 'none';
					}
					
					// Show loading modal for the file reading process
					const loadingElements = this._createLoadingModal('Reading file...');
					
					// Make sure loading elements have highest z-index
					if (loadingElements.modal && loadingElements.backdrop) {
						loadingElements.modal.style.zIndex = '100001';
						loadingElements.backdrop.style.zIndex = '100000';
					}
					
					// Process the file with staged updates for better user feedback
					const processFile = async () => {
						try {
							// Stage 1: Read file
							const reader = new FileReader();
							
							// Set up promise to handle file reading
							const fileContent = await new Promise<string>((resolve, reject) => {
								reader.onload = (e: any) => resolve(e.target.result as string);
								reader.onerror = () => reject(new Error('Failed to read the file'));
								reader.readAsText(file);
							});
							
							// Stage 2: Parse JSON
							await new Promise(resolve => setTimeout(resolve, 500));
							this._updateLoadingMessage(loadingElements.modal, 'Parsing JSON...');
							await new Promise(resolve => setTimeout(resolve, 500));
							
							const jsonFile = JSON.parse(fileContent);

							//if the import is a STIX bundle, scan it for embedded playbook_bins values
							if (jsonFile && jsonFile.type === 'bundle') {
								validateImportedStixBundle(jsonFile);
								const candidates = collectPlayboksFromStix(jsonFile);

								if (candidates.length === 1) {
									this.openPlaybookInNewTab(new Playbook(candidates[0].playbook));
									if (openButton) {
										openButton.classList.remove('entry--disable');
										openButton.style.pointerEvents = '';
									}
									this._removeLoadingModal(loadingElements);
									return;
								}

								if (candidates.length > 1) {
									this.showMultiPlaybookDialog(candidates);
									this._removeLoadingModal(loadingElements);
									return;
								}

								this._removeLoadingModal(loadingElements);
								throw new Error('STIX bundle is valid, but it contains no embedded CACAO playbook');
								}

							
							// Stage 3: Import playbook
							this._updateLoadingMessage(loadingElements.modal, 'Importing playbook...');
							await new Promise(resolve => setTimeout(resolve, 500));
							
							if (isCacaoPlaybook(jsonFile)) {
								this.openPlaybookInNewTab(new Playbook(jsonFile));
								this._removeLoadingModal(loadingElements);
								
								// Re-enable button after successful import
								if (openButton) {
									(openButton as HTMLElement).classList.remove('entry--disable');
									(openButton as HTMLElement).style.pointerEvents = '';
								}
							} else if (
								jsonFile.playbook !== undefined &&
								isCacaoPlaybook(jsonFile.playbook)
							) {
								this.openPlaybookInNewTab(
									new Playbook(jsonFile.playbook),
									jsonFile.execution_status,
								);
								this._removeLoadingModal(loadingElements);
								
								// Re-enable button after successful import
								if (openButton) {
									(openButton as HTMLElement).classList.remove('entry--disable');
									(openButton as HTMLElement).style.pointerEvents = '';
								}
							} else {
								// Re-enable button
								if (openButton) {
									(openButton as HTMLElement).classList.remove('entry--disable');
									(openButton as HTMLElement).style.pointerEvents = '';
								}
								this._removeLoadingModal(loadingElements);
								throw new Error('The JSON imported is not a CACAO playbook');
							}
						} catch (e: any) {
							// Re-enable button
							if (openButton) {
								(openButton as HTMLElement).classList.remove('entry--disable');
								(openButton as HTMLElement).style.pointerEvents = '';
							}
							this._removeLoadingModal(loadingElements);
							cacaoDialog.showAlert('Error when trying to import a file', e.message);
						}
					};
					
					// Start processing the file
					processFile();
				}
			},
			false,
		);
		fileInput.click();
	}

	//Popup dialog for when STIX bundle contains more than one valid embedded CACAO playbook 
	private showMultiPlaybookDialog(candidates: PlaybookCandidate[]) {
		const dialog = document.createElement('dialog') as HTMLDialogElement;
		dialog.className = 'dialog stix-chooser-dialog';
		dialog.style.outline = 'none';
		dialog.style.border = 'none';
		this._container.appendChild(dialog);

		const title = document.createElement('div');
		title.className = 'cacaoDialog__title';
		title.textContent = 'Multiple CACAO Playbooks Found';
		dialog.appendChild(title);

		const description = document.createElement('div');
		description.className = 'cacaoDialog__description';
		description.textContent = `Found ${candidates.length} CACAO playbooks in this STIX bundle.`;
		dialog.appendChild(description);

		const table = document.createElement('table');
		table.className = 'stix-chooser-table';

		const thead = document.createElement('thead');
		const headRow = document.createElement('tr');
		['Name', 'Type', 'Labels'].forEach(label => {
			const th = document.createElement('th');
			th.textContent = label;
			headRow.appendChild(th);
		});
		thead.appendChild(headRow);
		table.appendChild(thead);

		const tbody = document.createElement('tbody');
		candidates.forEach((candidate, index) => {
			const row = document.createElement('tr');
			row.className = 'stix-chooser-row';
			row.style.background = 'transparent';
			row.style.outline = 'none';
			row.style.boxShadow = 'none';

			row.onclick = () => {
				this.openPlaybookInNewTab(new Playbook(candidate.playbook));
				const button = this._container.querySelector('.button--open') as HTMLElement | null;
				if (button) {
					button.classList.remove('entry--disable');
					button.style.pointerEvents = '';
				}
			};

			const nameCell = document.createElement('td');
			nameCell.textContent = candidate.name ?? `Playbook ${index + 1}`;
			const typeCell = document.createElement('td');
			typeCell.textContent = candidate.playbook?.type ?? 'playbook';
			const labelCell = document.createElement('td');
			const labels = Array.isArray(candidate.playbook?.labels)
				? candidate.playbook.labels.join(', ')
				: '';
			labelCell.textContent = labels || '—';

			row.appendChild(nameCell);
			row.appendChild(typeCell);
			row.appendChild(labelCell);
			tbody.appendChild(row);
		});
		table.appendChild(tbody);
		dialog.appendChild(table);

		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'stix-chooser-actions';

		const resetImportButtonState = () => {
			const button = this._container.querySelector('.button--open') as HTMLElement | null;
			if (button) {
				button.classList.remove('entry--disable');
				button.style.pointerEvents = '';
			}
		};

		const openAllPlaybooks = document.createElement('button');
		openAllPlaybooks.className = 'buttonList__button button--primary';
		openAllPlaybooks.textContent = 'Open all playbooks in separate tabs';

		openAllPlaybooks.onclick = () => {
			for (const candidate of candidates) {
				this.openPlaybookInNewTab(new Playbook(candidate.playbook));
			}
			resetImportButtonState();
		};

		const cancel = document.createElement('button');
		cancel.className = 'buttonList__button button--secondary';
		cancel.textContent = 'Cancel';

		cancel.onclick = () => {
			resetImportButtonState();
			dialog.close();
			dialog.remove();
		};

		buttonContainer.appendChild(openAllPlaybooks);
		buttonContainer.appendChild(cancel);
		dialog.appendChild(buttonContainer);

		dialog.showModal();
	}

	private openPlaybookInNewTab(playbook: Playbook, status?: ExecutionStatus): void {
		const window = this._app.newWindow();
		window.loadEditor(playbook, status);
		this._app.openWindow(window);
	}

	private loadEditor(playbook: Playbook | undefined = undefined, status?: ExecutionStatus) {
		if (!playbook) {
			playbook = newPlaybook();
		}
		console.log('Importing playbook with Execution status: ', status);
		this._container.className = '';
		this._container.textContent = '';
		this._editor = new CacaoEditor(this._container, playbook, status);
		this._editor.addListener(() => {
			this.updateWindowTab(this._editor.playbook.name ?? '');
		});
		this.updateWindowTab(this._editor.playbook.name ?? '');
	}

	private updateWindowTab(name: string) {
		this._headerEntryTextElement.innerText = name;
		this._headerEntryTlpIndicator.className = '';

		const className = this._editor.playbookHandler
			.getTLPMarking()
			.replace(/[:+]/g, '-')
			.toLowerCase();
		if (className !== '') {
			this._headerEntryTlpIndicator.classList.add('tlp-icon');
			this._headerEntryTlpIndicator.classList.add(className);
		}
	}

	private createHeaderEntry(): HTMLElement {
		const entry = document.createElement('div');
		entry.className = 'header-tab-entry';
		entry.onclick = () => {
			this._app.openWindow(this);
		};

		this._headerEntryTlpIndicator = document.createElement('div');

		const removeButton = document.createElement('div');
		removeButton.className = 'header-tab-entry-remove-button';
		removeButton.onclick = async (event: Event) => {
			if (!this._editor || (await this._editor.canLeave())) {
				event.stopPropagation();
				entry.remove();
				this._app.closeWindow(this);
			}
		};

		this._headerEntryTextElement = document.createElement('div');
		this._headerEntryTextElement.className = 'header-tab-entry-title';
		this._headerEntryTextElement.innerText = 'New playbook';

		entry.appendChild(this._headerEntryTlpIndicator);
		entry.appendChild(this._headerEntryTextElement);
		entry.appendChild(removeButton);

		return entry;
	}
}

type PlaybookCandidate = {
	path: string;
	objectId?: string;
	name?: string;
	playbook: any;
};

function iteratePlaybookBins(value: any, path = '$'): Array<[string, string]>{
	const result: Array<[string, string]> = [];

	if (value && typeof value === 'object') {
		if (Array.isArray(value)) {
			value.forEach((item, index) => {
				result.push(...iteratePlaybookBins(item, `${path}[${index}]`));
			});
			return result;
		}

		for (const key of Object.keys(value)) {
			const child = value[key];
			const nextPath = `${path}.${key}`;

			if (key === 'playbook_bin' && typeof child === 'string') {
				result.push([nextPath, child]);
			} else {
				result.push(...iteratePlaybookBins(child, nextPath));
			}
		}
	}
	return result;
}

function validateImportedStixBundle(value: any): void {
    if (!value || typeof value !== 'object' || value.type !== 'bundle') {
        throw new Error('The imported STIX object is not a bundle');
    }

    if (!Array.isArray(value.objects)) {
        throw new Error('STIX bundle is missing an objects array');
    }

    let foundValidExtension = false;

    for (const obj of value.objects) {
        if (!obj || typeof obj !== 'object') continue;

        if (!obj.created || typeof obj.created !== 'string') {
            throw new Error('STIX object is missing created');
        }

        if (!obj.modified || typeof obj.modified !== 'string') {
            throw new Error('STIX object is missing modified');
        }

        const extensions = obj.extensions ?? {};
        for (const ext of Object.values(extensions)) {
            const candidate = ext as { extension_type?: unknown };
            if (candidate.extension_type === 'property-extension') {
                foundValidExtension = true;
            }
        }
    }

    if (!foundValidExtension) {
        throw new Error('STIX bundle does not contain any valid extension objects');
    }
}

function decodePlaybookBin(playbookBin: string): any {
	const base64 = playbookBin.replace(/\s+/g, '');
	const padded = base64 + '='.repeat((-base64.length) % 4);

	let decodedText: string;
	if (typeof window !== 'undefined' && typeof window.atob === 'function') {
		decodedText = window.atob(padded);
	} else {
		decodedText = atob(padded);
	}

	const parsed = JSON.parse(decodedText);

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		//decoded playbook is JSON, but it is not an object
		throw new Error('Decoded playbook_bin is not a valid JSON object');
	}
	
	if (parsed.type !== 'playbook') {
		throw new Error('Decoded playbook_bin is not a CACAO playbook');
	}

	if (!parsed.spec_version || !String(parsed.spec_version).startsWith('cacao-')) {
		throw new Error('decoded JSON does not look like a CACAO playbook: missing CACAO spec_version')

	}

	if (!parsed.id) {
		throw new Error('decoded JSON does not look like a CACAO playbook: missing id');
	}

	return parsed;
}

function collectPlayboksFromStix(value: any): PlaybookCandidate[] {
	const candidates: PlaybookCandidate[] = [];

	for (const [path, playbookBin] of iteratePlaybookBins(value)) {
		try {
			const playbook = decodePlaybookBin(playbookBin);
			candidates.push({
			path,
			objectId: value?.id ?? undefined,
			name: value?.name ?? undefined,
			playbook,
			});
		} catch (err: any) {
			//if invalid playbook_bin values, warn in the console (invalid Base64, not decoded to redeable text, text is not valid JSON, JSON not an object)
			console.warn(`Invalid playbook_bin at ${path}:`, err.message);
		}
	}

	return candidates;
}

function fileIsJSON(file: File): boolean {
	return file.type === 'application/json';
}

function isCacaoPlaybook(jsonFile: any): boolean {
	if (jsonFile.spec_version) {
		const spec_version: string = jsonFile.spec_version;
		return spec_version.toLowerCase().includes('cacao');
	}
	return false;
}
