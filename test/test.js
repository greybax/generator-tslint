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
        describe('withArguments()', function () {
            describe('rulesDirectory', function () {
                it('uses one rulesDirectory', function (done) {
                    var input = { rulesDirectory: 'node_modules/tslint-microsoft-contrib' };
                    generator().withArguments(['tslint-microsoft-contrib']).on('end', function () {
                        assert.jsonFileContent('tslint.json', input);
                        assert.fileContent('package.json', "tslint-microsoft-contrib");
                        done();
                    });
                });
                it('uses several rulesDirectory array', function (done) {
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
        
        describe('withOptions()', function () {
            describe('rulesDirectory', function () {
                it('uses one rulesDirectory from options', function (done) {
                    generator().withOptions({ rulesDirectory: 'tslint-microsoft-contrib' }).on('end', function () {
                        assert.jsonFileContent('tslint.json', { rulesDirectory: 'node_modules/tslint-microsoft-contrib' });
                        assert.fileContent('package.json', "tslint-microsoft-contrib");
                        done();
                    });
                });
            });
            describe('rulesDirectory', function () {
                it('uses rulesDirectory string from options', function (done) {
                    generator().withOptions({ rulesDirectory: 'tslint-microsoft-contrib,codelyzer' }).on('end', function () {
                        assert.jsonFileContent('tslint.json', { rulesDirectory: ['node_modules/tslint-microsoft-contrib','node_modules/codelyzer/dist/src'] });
                        assert.fileContent('package.json', "tslint-microsoft-contrib");
                        done();
                    });
                });
            });
            
            describe('extends', function () {
                it('uses extends string with one item from options', function (done) {
                    generator().withOptions({ extends: './tslint-config' }).on('end', function () {
                        assert.jsonFileContent('tslint.json', { extends: ['./tslint-config'] });
                        done();
                    });
                });

                it('uses extends string from options', function (done) {
                    generator().withOptions({ extends: './tslint-config,./tslint-config-2' }).on('end', function () {
                        assert.jsonFileContent('tslint.json', { extends: ['./tslint-config', './tslint-config-2'] });
                        done();
                    });
                });

                it('uses extends array with one item from options', function (done) {
                    var input = { extends: ['./tslint-config'] };
                    generator().withOptions(input).on('end', function () {
                        assert.jsonFileContent('tslint.json', input);
                        done();
                    });
                });

                it('uses extends array from options', function (done) {
                    var input = { extends: ['./tslint-config', './tslint-config-2'] };
                    generator().withOptions(input).on('end', function () {
                        assert.jsonFileContent('tslint.json', input);
                        done();
                    });
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
                assert.jsonFileContent('tslint.json', output);
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
        
        it('uses config.extends string option', function (done) {
            var input = { extends: './tslint-config' };
            generator().withOptions({ config: input }).on('end', function () {
                assert.jsonFileContent('tslint.json', input);
                done();
            });
        });
        it('uses config.extends array option', function (done) {
            var input = { extends: ['./tslint-config', './tslint-config-2'] };
            generator().withOptions({ config: input }).on('end', function () {
                assert.jsonFileContent('tslint.json', input);
                done();
            });
        });
    });

});