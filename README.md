# Single Origin ☕️

Asset deduplication for React and React Native projects

> 🚨 Please note! 🚨
>
> This project is under active development, APIs are **very** likely to change, and is still experimental, so please make sure you work on a separate branch as to not lose any files until production ready 🙃

## Why?

If you've used React and React Native, the philosophy of creating modular components has been embedded in us for some time. Usually within a loosely coupled component, it contains everything it needs, from the View, Styles, Tests etc. However, in every project I contribute towards, I always see the same occurrence, the global images folder.

The global image folder is an exception to that modular rule, and with time we find that our images folder increases in size, and sooner or later on large scale projects it becomes a burden to look through images, or rely on friendly naming conventions to find an image that might have been used before, thus not increasing your project source size unnecessarily.

![image](https://i.imgur.com/BHrBONf.png)

## Solution

With Single Origin, it encourages the user to include the image with the component, allowing the image to move freely with the module as a whole, no more long absolute references back to image or aliases.

Single Origin does this using its Command Line Utility, after configuration it looks through your source files and identifies images based on a matcher, it then hoists the image into a global directory and leaves behind a Symlink or Reference File with the same name, duplicate images use the same source.

## Installation

```
yarn add single-origin@0.0.1-beta.2
```

1. Add a global target folder for your images e.g. `my-react-project/images`
2. Create an empty `my-react-project/images/map.json` file inside of global target Folder
3. Run the [`create`](#create) command in the project root folder, e.g. `single-origin --create`

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