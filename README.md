# VS Code Extension: Scratch Manager

VS Code extension to manage scratch files in a VS Code project.

## Features

* **Create File**  
  The Scratch Manager can create new scratch files in the specified folder. The files are created based on the specified templates.

* **Archive File(s)**  
  Old scratch files can be organized into a date-based hierarchical archive. All files older than the specified threshold days are moved into their respective archive folder.

* **Template Configuration**  
  The scratch file templates can be adjusted as needed. It's built-in with a PowerShell v5 script template.

## Extension Settings

Use the following extension configuration:

* `scratchManager.activeFolder`: Specify the relative path used for new scratch files. Defaults to `Scratch`.
* `scratchManager.activeScopes`: Specify the scopes to use for new scratch files. Defaults to no scopes, using the workspace root folder.
* `scratchManager.archiveFolder`: Specify the relative path to the scratch file archive. Defaults to `Scratch`.
* `scratchManager.archiveThresholdDays`: Specify the number of days to keep scratch files before archiving them. Defaults to 90 days.
* `scratchManager.archiveAutomatically`: Specify if scratch files should be archived automatically. Defaults to off.

## Folder Structure

When using no scopes (activeScopes configuration is empty), the following path will be constructed with the following schema: `<WorkspaceFolder>/<ActiveFolder>`.

If the scoping options is used, the following schema will be used: `<WorkspaceFolder>/<ActiveScope>/<ActiveFolder>`. The create file command will ask the user for the scope to use. The archive files command will archive all files from all scopes older than the threshold days.

## Release Notes

Please find the release notes in the [CHANGELOG.md] file.

## Constraint

This software is provided "as is", without any guarantees on the function and operation of the Intex devices. You use it at your own risk. For more details, check the license terms.

Icons created by [Smashicons - Flaticon](https://www.flaticon.com/free-icons/pencil).
