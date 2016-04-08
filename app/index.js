"use strict";

var yeoman = require('yeoman-generator');
var R = require('ramda');
var depsObject = require('deps-object');
var sortedObject = require('sorted-object');
var splitKeywords = require('split-keywords');

var getPkgName = function getPkgName(str) { return (str || '').split('/')[0]; };

var stringify = function stringify(obj) {
    return JSON.stringify(obj, null, 2);
};
var parse = function() {
    JSON.parse.bind(JSON);
};
var truncateRulesDirectory = function truncateRulesDirectory(input) {
    var obj = input;
    if (obj.rulesDirectory && obj.rulesDirectory.length === 1) {
        obj.rulesDirectory = obj.rulesDirectory[0];
    }
    return obj;
};

// concatAll :: [Array] -> Array
var concatAll = R.reduce(R.concat, []);

module.exports = yeoman.Base.extend({
    constructor: function () {
        yeoman.Base.apply(this, arguments);
        this.argument('rulesDirectory', { type: Array, required: false,
            desc: 'rulesDirectory list: "yo tslint tslint-microsoft-contrib"'
        });
        this.option('rulesDirectory', { type: String, required: false,
            desc: 'Rules list: "yo tslint tslint-microsoft-contrib"'
        });

        this.saveDepsToPkg = function (deps) {
            var pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
            var currentDeps = pkg.devDependencies || {};
            var mergedDeps = R.merge(currentDeps, deps);
            var sortedDeps = sortedObject(mergedDeps);
            pkg.devDependencies = sortedDeps;
            this.fs.writeJSON(this.destinationPath('package.json'), pkg);
        };
    },
    writing: function () {
        let cli = {};
        let packages = [];
        
        /*
        Up-to-date this dictionary in accordance with http://palantir.github.io/tslint/usage/custom-rules/
         */
        var dictionary = {
            "tslint-microsoft-contrib": "node_modules/tslint-microsoft-contrib",
            "tslint-eslint-rules": "node_modules/tslint-eslint-rules/dist/rules",
            "codelyzer": "node_modules/codelyzer/dist/src"
        }

        if (this.rulesDirectory) {
            cli.rulesDirectory = (typeof this.rulesDirectory === 'string')
                ? splitKeywords(this.rulesDirectory)
                : this.rulesDirectory;
            packages = cli.rulesDirectory;
            
            cli.rulesDirectory = cli.rulesDirectory.map((rule) => dictionary[rule]);
        }

        let options = this.options.config || {};
        if (options.rulesDirectory) {
            options.rulesDirectory = (typeof options.rulesDirectory === 'string')
                ? splitKeywords(options.rulesDirectory)
                : options.rulesDirectory;
            packages = options.rulesDirectory;
            
            options.rulesDirectory = options.rulesDirectory.map((rule) => dictionary[rule]);
        }

        let existing = this.fs.exists(this.destinationPath('tslint.json'))
            ? parse(this.fs.read(this.destinationPath('tslint.json')))
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
    },
    install: function () {
        if (!this.options['skip-install']) {
            this.npmInstall();
        }
    }
});