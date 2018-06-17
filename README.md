# Single Origin ☕️

Image deduplication for React and React Native projects

> 🚨 Please note! 🚨
>
> This project is under active development, APIs are **very** likely to change, and is still experimental, so please make sure you work on a separate branch as to not lose any files until production ready 🙃

## Why?

In a loosely coupled component world, its common for the View, Styles, Tests etc to coexist together.

The global image folder is an exception to that modular rule, and with time we find our image folder increases in size as a project grows. We become reliant on friendly naming conventions or manually searching through a catalogue of images to avoid adding a duplicates.

<img src="https://i.imgur.com/BHrBONf.png" width="400" />

## Solution

With Single Origin, it encourages the user to couple an image within a component folder, allowing the image to move freely with the module as a whole.

Single Origin does this by walking a projects source files and identifies images based on it's matcher, it then hoists unique images into a global directory and leaves behind a Symlink or Reference File with the same name.

## Installation

```
yarn add single-origin@0.0.1-beta.2
```

1. Add a global target folder for your images e.g. `my-react-project/images`
2. Create an empty `my-react-project/images/map.json` file inside of global target Folder
3. Run the [`create`](#create) command in the project root folder, e.g. `single-origin --create`
4. Start putting your images inside your component folder! 🎉

## Configuration

Configuration for Single Origin is driven via `package.json`. e.g:

```json
{
  "singleOrigin": {
    "symlinks": false,
    "ignorePaths": [
      "<rootDir>/node_modules/**",
      "<rootDir>/android/**",
      "<rootDir>/ios/**"
    ],
    "imagePath": "<rootDir>/images",
    "matcher": "./**/*.png",
    "rootDir": "./example/RNSingleOrigin",
    "mapFilename": "map.json"
  }
}
```

### Options

| Option        | Type    | Description                     | Default                |
|---------------|---------|---------------------------------|------------------------|
| `symlinks`    | boolean | Enable symlinks                 | `true`                 |
| `ignorePaths` | array   | Locations of folders to ignore  | `/node_modules/**`     |
| `imagePath`   | string  | Global target folder            | `./images`             |
| `matcher`     | string  | Regex for locating image        | `./**/*.png`           |
| `rootDir`     | string  | Manually provide root directory | `process.cwd()`        |
| `mapFilename` | string  | Name of map file                | `map.json`             |

## Usage

Single Origin works really well with tools such as [Lint Staged](https://github.com/okonet/lint-staged) and [Husky](https://github.com/typicode/husky).

```
yarn add lint-staged husky --dev
```

Inside your `package.json`

```json
{
  "scripts": {
    "precommit": "lint-staged"
  },
  "lint-staged": {
    "*.{png}": ["single-origin --create", "git add"]
  }
}
```

## API

Single origin is a command line utility, to get help directly from the CLI use the help flag at any time.

```
single-origin --help
```

### `create`

Searches your project folders for new images, and hoists into global target folder.

```
single-origin --create
```

### `update`

Updates your existing map with images that have been removed from the project.

```
single-origin --update
```

### `revert`

Reverts your global target folder and puts images back into original folders

## FAQ

> Should I use this in Production?

Single Origin is still in BETA, but should you use it, please open an issue in Github if you find something doesn't work. Remember to test on a separate branch to avoid any disasters!

> I use the metro bundler for React Native, will this work with Symlinks?

Mixed results in testing! Which is why Single Origin defaults to "Folder References" for React Native, we take advantage of the Node resolver and create a folder name with of the image, and include a default export inside an `index.js`

> Does this work with [Haul](https://github.com/callstack/haul) bundler?

Not sure yet, will get around to it soon.

> Doesn't Webpack do something like this?

Kinda! _but_ only for production bundles, which means you still need to include all duplicate images inside your source.

## 1.0.0 todo list

-[ ] Test coverage
-[ ] Move to Node Async APIs
-[ ] Improve public API to just `single-origin` for create/update pipeline
-[ ] Test on unix and Windows systems
-[ ] Automagically detect React Native projects and set defaults
