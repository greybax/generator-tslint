'use strict';

var path = require('path');
var R = require('ramda');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var depsObject = require('deps-object');

var generator = function () {
  return helpers.run(path.join(__dirname, '../app'));
};

describe('generator-tslint:app', function () {
    it('creates files', function (done) {
        generator().on('end', function () {
            assert.file('tslint.json');
            done();
        });
    });

    it('creates empty files with zero input', function (done) {
        generator().on('end', function () {
            assert.jsonFileContent('tslint.json', {});
            assert.fileContent('package.json', "tslint");
            assert.fileContent('package.json', "typescript");
            done();
        });
    });

    describe('cli', function () {
        describe('rulesDirectory', function () {
            it('uses one rulesDirectory from arguments', function (done) {
                var input = { rulesDirectory: 'node_modules/tslint-microsoft-contrib' };
                generator().withArguments(['tslint-microsoft-contrib']).on('end', function () {
                    assert.jsonFileContent('tslint.json', input);
                    assert.fileContent('package.json', "tslint-microsoft-contrib");
                    done();
                });
            });
            it('uses several rulesDirectory array from arguments', function (done) {
                var input = { rulesDirectory: [
                      'node_modules/tslint-microsoft-contrib'
                    , 'node_modules/tslint-eslint-rules/dist/rules'
                    , 'node_modules/codelyzer/dist/src'
                ]};
                generator().withArguments([
                      'tslint-microsoft-contrib'
                    , 'tslint-eslint-rules'
                    , 'codelyzer'])
                    .on('end', function () {
                        assert.jsonFileContent('tslint.json', input);
                        assert.fileContent('package.json', "tslint-microsoft-contrib");
                        assert.fileContent('package.json', "tslint-eslint-rules");
                        assert.fileContent('package.json', "codelyzer");
                        done();
                });
            });
        });
    });
    
    describe('compose', function () {
        it('uses config option', function (done) {
            var input = { key: 'val' };
            generator().withOptions({ config: input }).on('end', function () {
                assert.jsonFileContent('tslint.json', input);
                done();
            });
        });
        it('uses config.rulesDirectory string option', function (done) {
            var input = { rulesDirectory: 'tslint-microsoft-contrib' };
            var output = { rulesDirectory: 'node_modules/tslint-microsoft-contrib' };
            generator().withOptions({ config: input }).on('end', function () {
                assert.jsonFileContent('tslint.json', input);
                assert.fileContent('package.json', "tslint-microsoft-contrib");
                done();
            });
        });
        it('uses config.rulesDirectory array option', function (done) {
            var input = { 
                    rulesDirectory: [
                        'tslint-microsoft-contrib'
                        , 'tslint-eslint-rules'
                        , 'codelyzer'
                    ]
                };
            var output = { 
                rulesDirectory: [
                      'node_modules/tslint-microsoft-contrib'
                    , 'node_modules/tslint-eslint-rules/dist/rules'
                    , 'node_modules/codelyzer/dist/src'
                ]
            };
            generator().withOptions({ config: input }).on('end', function () {
                assert.jsonFileContent('tslint.json', output);
                assert.fileContent('package.json', "tslint-microsoft-contrib");
                assert.fileContent('package.json', "tslint-eslint-rules");
                assert.fileContent('package.json', "codelyzer");
                done();
            });
        });
    });

});