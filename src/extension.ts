import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Configuration for the Scratch Manager.
 */
class ScratchManagerConfiguration {

	/**
	 * Get the raw configuration string value.
	 * @param name Configuration name.
	 * @returns Configuration value.
	 */
	public getConfigurationString(name: string): string {
		let value = vscode.workspace.getConfiguration('scratchManager').get(name) as string;
		if (value === null || value === undefined || value.trim() === '') {
			throw new Error(`Configuration '${name}' not found in 'scratchManager'.`);
		}
		return value;
	}

	/**
	 * Get the raw configuration number value.
	 * @param name Configuration name.
	 * @returns Configuration value.
	 */
	public getConfigurationNumber(name: string): number {
		let value = vscode.workspace.getConfiguration('scratchManager').get(name) as number;
		if (value === null || value === undefined) {
			throw new Error(`Configuration '${name}' not found in 'scratchManager'.`);
		}
		return value;
	}

	/**
	 * Get the raw configuration boolean value.
	 * @param name Configuration name.
	 * @returns Configuration value.
	 */
	public getConfigurationBoolean(name: string): boolean {
		let value = vscode.workspace.getConfiguration('scratchManager').get(name) as boolean;
		if (value === null || value === undefined) {
			throw new Error(`Configuration '${name}' not found in 'scratchManager'.`);
		}
		return value;
	}

	/**
	 * Get the active folder as full file system path.
	 * @returns The active folder path.
	 */
	public getActiveFolderPath(): string {

		if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length === 0) {
			throw new Error('Workspace folder is not available.');
		}

		const configActiveFolder = this.getConfigurationString('activeFolder');
		const workspaceFolderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

		return path.join(workspaceFolderPath, configActiveFolder);
	}

	/**
	 * Get the archive folder as full file system path.
	 * @returns The archive folder path.
	 */
	public getArchiveFolderPath(): string {

		if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length === 0) {
			throw new Error('Workspace folder is not available.');
		}

		const configActiveFolder = this.getConfigurationString('archiveFolder');
		const workspaceFolderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

		return path.join(workspaceFolderPath, configActiveFolder);
	}

	/**
	 * Get the archive threshold in days for the scratch files.
	 * @returns The archive threshold in days.
	 */
	public getArchiveThresholdDays(): number {

		return this.getConfigurationNumber('archiveThresholdDays');
	}

	/**
	 * Get the archive automatically flag.
	 * @returns The archive automatically flag.
	 */
	public getArchiveAutomatically(): boolean {

		return this.getConfigurationBoolean('archiveAutomatically');
	}
}

/**
 * Type of a Template for the Scratch Manager.
 */
type ScratchManagerTemplate = {
	name: string;
	content: string;
	extension: string;
};

/**
 * Template Data used to fill a Template of the Scratch Manager.
 */
type ScratchManagerTemplateData = {
	title: string;
	username: string;
	date: Date;
};

/**
 * Template Manager for the Scratch Manager.
 */
class ScratchManagerTemplateManager {
	private templateFolderPath: string;
	private templateFilePath: string;

	private templateEncoding: string = "\ufeff"; // UTF8 with BOM

	private defaultTemplates: ScratchManagerTemplate[] = [
		{
			name: "PowerShell Script (v5)",
			content: "#Requires -Version 5\n#Requires -Modules @{ ModuleName = 'Pester'; MaximumVersion = '4.99.99' }\n\n<#\n    .SYNOPSIS\n        {{title}}\n\n    .NOTES\n        {{date}}   {{username}}   Script created\n#>\n\n",
			extension: "ps1"
		}
	];

	/**
	 * Initialize the template manager.
	 * @param context The VS Code extension context.
	 */
	constructor(context: vscode.ExtensionContext) {

		this.templateFolderPath = context.globalStorageUri.fsPath;
		this.templateFilePath = path.join(this.templateFolderPath, 'templates.json');

		this.initializeTemplates();
	}

	/**
	 * Initialize the default templates.
	 */
	private initializeTemplates() {

		// Ensure the template folder exists
		if (!fs.existsSync(this.templateFolderPath)) {
			fs.mkdirSync(this.templateFolderPath);
		}

		// Ensure the template file exists
		if (!fs.existsSync(this.templateFilePath)) {
			fs.writeFileSync(this.templateFilePath, JSON.stringify(this.defaultTemplates, null, '\t'), { encoding: 'utf8' });
		}
	}

	/**
	 * Get the path to the template configuration file.
	 */
	public getConfigPath(): string {

		return this.templateFilePath;
	}

	/**
	 * Get a single template by name.
	 * @param name The template name.
	 */
	public getTemplate(name: string): ScratchManagerTemplate {

		let templates = this.getTemplates();
		for (let template of templates) {
			if (template.name === name) {
				return template;
			}
		}

		throw new Error(`Template with name ${name} not found.`);
	}

	/**
	 * Get all templates.
	 */
	public getTemplates(): ScratchManagerTemplate[] {

		return JSON.parse(fs.readFileSync(this.templateFilePath, 'utf8'));
	}

	/**
	 * Get all templates names.
	 */
	public getTemplateNames(): string[] {

		return this.getTemplates().map(template => template.name);
	}

	/**
	 * Return the parsed template content.
	 * @param template The template to parse.
	 * @param data The template data to inject.
	 */
	public static parseTemplateContent(template: ScratchManagerTemplate, data: ScratchManagerTemplateData): string {

		let templateContent = template.content;
		templateContent = templateContent.replace('{{title}}', data.title);
		templateContent = templateContent.replace('{{username}}', data.username);
		templateContent = templateContent.replace('{{date}}', data.date.toLocaleDateString());
		return templateContent;
	}
}

/**
 * Helper functions for the Scratch Manager.
 */
class ScratchManagerHelper {

	public static getScratchFilename(title: string, extension: string): string {

		// ISO date string
		let isoDate = new Date().toISOString().substring(0, 10);

		// Normalize title
		let normalizedTitle = title;
		normalizedTitle = normalizedTitle.replace(/[\/\\:<>"|?*]/g, '');   // Remove special forbidden file system characters
		normalizedTitle = normalizedTitle.replace(/\s/g, '_');             // Replace whitespace with underline

		return `${isoDate}_${normalizedTitle}.${extension}`;
	}
}

export function activate(context: vscode.ExtensionContext) {

	console.log('[ScratchManager] Extension activation started');

	const configuration = new ScratchManagerConfiguration();
	const templateManager = new ScratchManagerTemplateManager(context);

	/**
	 * Command: Create File
	 */
	context.subscriptions.push(vscode.commands.registerCommand('scratchManager.createFile', async () => {

		// Get user input: Template
		const templateName = await vscode.window.showQuickPick(templateManager.getTemplateNames());
		if (templateName === undefined) {
			return; // Quick pick was canceled with ESC
		}

		// Get user input: Title
		const title = await vscode.window.showInputBox({
			prompt: 'Title',
			validateInput: text => {
				if (text === null || text === undefined || text.trim() === '') {
					return "This is an invalid title, please enter alphanumeric characters.";
				}
				return null;
			}
		});
		if (title === undefined) {
			return; // Quick pick was canceled with ESC
		}

		// Gather all details for the scratch file
		const template = templateManager.getTemplate(templateName);
		const folderPath = configuration.getActiveFolderPath();
		const fileName = ScratchManagerHelper.getScratchFilename(title, template.extension);
		const filePath = path.join(folderPath, fileName);
		const content = ScratchManagerTemplateManager.parseTemplateContent(template, { title: title, username: os.userInfo().username, date: new Date() });

		// Prevent replacing an existing file
		if (fs.existsSync(filePath)) {
			throw new Error(`The scratch file with the following path does already exist: ${filePath}`);
		}

		// Create parent folder (if required)
		if (!fs.existsSync(folderPath)) {
			await fs.promises.mkdir(folderPath, { recursive: true });
		}

		// Create scratch file and show it in the editor
		await fs.promises.writeFile(filePath, content);
		vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(doc => { vscode.window.showTextDocument(doc); });

		// Archive files automatically if enabled
		if (configuration.getArchiveAutomatically()) {
			vscode.commands.executeCommand('scratchManager.archiveFiles');
		}
	}));

	/**
	 * Command: Organize Archive
	 */
	context.subscriptions.push(vscode.commands.registerCommand('scratchManager.archiveFiles', async () => {

		const fileDetection = /^[0-9]{4}-[0-9]{2}-[0-9]{2}_/;

		const thresholdDays = configuration.getArchiveThresholdDays();
		const thresholdDate = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * thresholdDays));

		console.log(`Date: ${thresholdDate}`);

		const activeFolderPath = configuration.getActiveFolderPath();
		const archiveFolderPath = configuration.getArchiveFolderPath();

		// Get all files in the active folder path.
		const fileNames = await fs.promises.readdir(activeFolderPath);
		for (let fileName of fileNames) {

			// Check the files for the pattern with a beginning date.
			if (fileDetection.test(fileName)) {

				const fileDate = new Date(fileName.substring(0, 10));

				// Check if the date of the file is older than the threshold.
				if (fileDate.getTime() < thresholdDate.getTime()) {

					const newFolderPath = path.join(archiveFolderPath, fileName.substring(0, 4), fileName.substring(5, 7));

					const filePath = path.join(activeFolderPath, fileName);
					const newFilePath = path.join(newFolderPath, fileName);

					// Create the archive folder (if required)
					if (!fs.existsSync(newFolderPath)) {
						await fs.promises.mkdir(newFolderPath, { recursive: true });
					}

					console.log(`File Name: ${fileName} / Date: ${fileDate} / Archive Folder Path: ${newFolderPath} / Move File: ${filePath} => ${newFilePath}`);

					// Move the file to the new folder
					await fs.promises.rename(filePath, newFilePath);
				}
			}
		}
	}));

	/**
	 * Command: Open Template Configuration
	 */
	context.subscriptions.push(vscode.commands.registerCommand('scratchManager.openTemplateConfiguration', async () => {

		const templateConfigPath = templateManager.getConfigPath();
		vscode.workspace.openTextDocument(vscode.Uri.file(templateConfigPath)).then(doc => { vscode.window.showTextDocument(doc); });

		// Archive files automatically if enabled
		if (configuration.getArchiveAutomatically()) {
			vscode.commands.executeCommand('scratchManager.archiveFiles');
		}
	}));

	// Archive files automatically if enabled
	if (configuration.getArchiveAutomatically()) {
		vscode.commands.executeCommand('scratchManager.archiveFiles');
	}

	console.log('[ScratchManager] Extension activation completed');
}

export function deactivate() {

	console.log('[ScratchManager] Extension deactivation completed');
}
