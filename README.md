Fork that adds some orioledb project specific behavior:
- Custom icons added (doesn't remember where I found them and which license they had originaly)
- pgspec format tweaks
- out files formats
- orioledb specific behaviour to separate different out files in result dirrectory
# pgspec

VS Code language plugin for PostgreSQL isolation test spec files
(based on [this specification](https://github.com/postgres/postgres/blob/master/src/test/isolation/README))

## Installation

You can use this [Visual Studio Market link](https://marketplace.visualstudio.com/items?itemName=onlined.pgspec) to install this plugin in VSCode

Fork may be installed using [vsce](https://github.com/microsoft/vscode-vsce)
```
vsce package
code --install-extension pgspec-1.0.1.vsix
```
