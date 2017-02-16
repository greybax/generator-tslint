"use strict";

const Generator = require('yeoman-generator');
const R = require('ramda');
const depsObject = require('deps-object');
const sortedObject = require('sorted-object');
const splitKeywords = require('split-keywords');

const getPkgName = function getPkgName(str) { return (str || '').split('/')[0]; };

const stringify = function stringify(obj) {
  return JSON.stringify(obj, null, 2);
};
const parse = function () {
  JSON.parse.bind(JSON);
};

// concatAll :: [Array] -> Array
const concatAll = R.reduce(R.concat, []);

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument('rulesDirectory', {
      type: Array, required: false,
      desc: 'rulesDirectory list: "yo tslint tslint-microsoft-contrib"'
    });
    this.option('rulesDirectory', {
      type: String, required: false, alias: "r",
      desc: 'rulesDirectory list: "yo tslint -r tslint-microsoft-contrib"'
    });
    this.option('extends', {
      type: String, required: false, alias: "e",
      desc: 'extends list: "yo tslint -e tslint-microsoft-contrib"'
    });

    this.saveDepsToPkg = function (deps) {
      let pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      let currentDeps = pkg.devDependencies || {};
      let mergedDeps = R.merge(currentDeps, deps);
      let sortedDeps = sortedObject(mergedDeps);
      pkg.devDependencies = sortedDeps;
      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    };
  }

  writing() {
    let cli = {};
    let packages = [];

    // Up-to-date this dictionary in accordance with http://palantir.github.io/tslint/usage/custom-rules/
    let dictionary = {
      "tslint-microsoft-contrib": "node_modules/tslint-microsoft-contrib",
      "tslint-eslint-rules": "node_modules/tslint-eslint-rules/dist/rules",
      "codelyzer": "node_modules/codelyzer/dist/src"
    }

    // arguments
    if (this.rulesDirectory) {
      cli.rulesDirectory = (typeof this.rulesDirectory === 'string')
        ? splitKeywords(this.rulesDirectory)
        : this.rulesDirectory;
      packages = cli.rulesDirectory;

      cli.rulesDirectory = cli.rulesDirectory.map(
        function (rule) {
          return dictionary[rule];
        }
      );
    }

    // options
    let rulesDirectory = this.options.rulesDirectory;
    if (this.options.config && this.options.config.rulesDirectory) {
      rulesDirectory = this.options.config.rulesDirectory
    }
    if (typeof rulesDirectory === "boolean") {
      this.log('Maybe you forgot double dash: `-rulesDirectory` instead of `--rulesDirectory`');
    }
    if (rulesDirectory) {
      cli.rulesDirectory = (typeof rulesDirectory === 'string')
        ? splitKeywords(rulesDirectory)
        : rulesDirectory;
      packages = cli.rulesDirectory;
      cli.rulesDirectory = cli.rulesDirectory.map(
        function (rule) {
          return dictionary[rule];
        }
      );
    }

    let ext = this.options.extends;
    if (typeof ext === "boolean") {
      this.log('Maybe you forgot double dash: `-extends` instead of `--extends`');
    }
    if (ext) {
      cli.extends = (typeof ext === 'string')
        ? splitKeywords(ext)
        : ext;
    }

    let existing = this.fs.exists(this.destinationPath('tslint.json'))
      ? parse(this.fs.read(this.destinationPath('tslint.json')))
      : {};

    let options = this.options.config && !this.options.config.rulesDirectory
      ? this.options.config
      : {};
    let result = R.mergeAll([existing, cli, options]);
    this.fs.write(
      this.destinationPath('tslint.json'),
      (stringify(result) + '\n')
    );

    let deps = concatAll([
      ['tslint@latest', 'typescript@latest'],
      (packages || []).map(getPkgName)
    ]);
    return depsObject(deps)
      .then(function (devDeps) {
        this.saveDepsToPkg(devDeps);
      }.bind(this))
      .catch(function (reason) {
        throw reason;
      }.bind(this));
  }

  install() {
    if (!this.options['skip-install']) {
      this.npmInstall();
    }
  }
};