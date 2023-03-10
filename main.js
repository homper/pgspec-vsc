const vscode = require("vscode");
const posix = require("path").posix;

/**
 * @param {vscode.ExtensionContext} context
 */
// The code you place here will be executed every time your command is executed
async function activate(context) {
    const workspace = vscode.workspace;
    const fs = workspace.fs;
    const config = workspace.getConfiguration();
    var   values = config.get('files.associations');
    const root = workspace.workspaceFolders[0].uri;
    const expected = vscode.Uri.parse(`${root}/expected`)
    const reg_tests = vscode.Uri.parse(`${root}/sql`)
    const isol_tests = vscode.Uri.parse(`${root}/specs`)

    let count = 0;
    var exp_files = [];
    try {
        for (const [name, type] of await fs.readDirectory(expected)) {
            if (type === vscode.FileType.File) {
                const parsed = posix.parse(name);
                exp_files.push(parsed.name);
                count += 1;
            }
        }
    } catch (e) {
        if (e instanceof vscode.FileSystemError) {
            return;
        }
        else {
            throw e;  // re-throw the error unchanged
        }
    }
    var reg_files = [];
    try {
        for (const [name, type] of await fs.readDirectory(reg_tests)) {
            if (type === vscode.FileType.File) {
                const parsed = posix.parse(name);
                reg_files.push(parsed.name);
            }
        }
    } catch (e) {
        if (e instanceof vscode.FileSystemError) {
            return;
        }
        else {
            throw e;  // re-throw the error unchanged
        }
    }
    var isol_files = [];
    try {
        for (const [name, type] of await fs.readDirectory(isol_tests)) {
            if (type === vscode.FileType.File) {
                const parsed = posix.parse(name);
                isol_files.push(parsed.name);
            }
        }
    } catch (e) {
        if (e instanceof vscode.FileSystemError) {
            return;
        }
        else {
            throw e;  // re-throw the error unchanged
        }
    }

    // console.log("expected: " + exp_files)
    // console.log("reg_files: " + reg_files)
    // console.log("isol_files: " + isol_files)

    const filtered = Object.keys(values)
        .filter(key => !key.startsWith('**/expected/') || exp_files.includes(posix.parse(key).name))
        .reduce((obj, key) => {
            obj[key] = values[key];
            return obj;
    }, {});
    // console.log("filtered: " + JSON.stringify(Object.keys(values).filter(key => key.startsWith('**/expected/')).map(key => posix.parse(key))))
    // console.log("filtered: " + JSON.stringify(filtered))
    values = filtered;

    for (const name of reg_files)
    {
        const filtered = exp_files.filter(key => key.match(`^${name}(_\\d+)?$`) != null);
        for (const filtered_name of filtered)
        {
            values[`**/expected/${filtered_name}.out`] = "pgregress-out";
        }
    }
    for (const name of isol_files)
    {
        const filtered = exp_files.filter(key => key.match(`^${name}(_\\d+)?$`) != null);
        for (const filtered_name of filtered)
        {
            values[`**/expected/${filtered_name}.out`] = "pgspec-out";
        }
    }
    values["**/output_iso/results/*.out"] = "pgspec-out";
    values["**/results/*.out"] = "pgregress-out";

    config.update('files.associations', values);

    vscode.window.showInformationMessage('.out files associations updated');

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((e) => {
            var update = false;
            const parsed = posix.parse(e.fileName);
            const new_values = vscode.workspace.getConfiguration().get('files.associations');

            if (parsed.ext == ".sql")
            {
                if (posix.parse(e.uri.fsPath).dir == vscode.Uri.parse(`${root}/sql`).path)
                {
                    new_values[`**/expected/${parsed.name}.out`] = "pgregress-out";
                    update = true;
                }
            }
            else if (parsed.ext == ".spec")
            {
                if (posix.parse(e.uri.fsPath).dir == vscode.Uri.parse(`${root}/specs`).path)
                {
                    new_values[`**/expected/${parsed.name}.out`] = "pgspec-out";
                    update = true;
                    // console.log("new_values: " + new_values)
                }
            }

            if (update)
                config.update('files.associations', new_values);
        }))
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}