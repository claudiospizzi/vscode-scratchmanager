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

* `scratchManager.activeFolder`: Specify the relative path used for new scratch files.
* `scratchManager.archiveFolder`: Specify the relative path to the scratch file archive.

## Release Notes

Please find the release notes in the [CHANGELOG.md] file.