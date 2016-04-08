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
        var cli = {};
        var packages = [];
        
        // Up-to-date this dictionary in accordance with http://palantir.github.io/tslint/usage/custom-rules/
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
            
            cli.rulesDirectory = cli.rulesDirectory.map(
                function(rule) {
                    return dictionary[rule];
                }
            );
        }

        var options = this.options.config || {};
        if (options.rulesDirectory) {
            options.rulesDirectory = (typeof options.rulesDirectory === 'string')
                ? splitKeywords(options.rulesDirectory)
                : options.rulesDirectory;
            packages = options.rulesDirectory;
            
            options.rulesDirectory = options.rulesDirectory.map(
                function(rule) {
                    return dictionary[rule];
                }
            );
        }

        var existing = this.fs.exists(this.destinationPath('tslint.json'))
            ? parse(this.fs.read(this.destinationPath('tslint.json')))
            : {};
            
        var result = R.mergeAll([existing, cli, options]);
        this.fs.write(
            this.destinationPath('tslint.json'),
            (stringify(result) + '\n')
        );

        var deps = concatAll([
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