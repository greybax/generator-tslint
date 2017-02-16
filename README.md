# generator-tslint

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![DevDependency Status][depstat-dev-image]][depstat-dev-url]

> [Yeoman](http:\\yeoman.io) generator to get [tslint](https://palantir.github.io/tslint/) up and running in your project with your favorite preset

## Install

    npm install --global yo generator-tslint

## Usage

```bash
# nope, it will do nothing, just install tslint into your project
yo tslint

# install tslint with your favorite preset
yo tslint tslint-microsoft-contrib

# you can select some presets for tslint
yo tslint tslint-microsoft-contrib,tslint-eslint-rules

```

For now supporting only (in accordance with http://palantir.github.io/tslint/usage/custom-rules/)

* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)
* [tslint-eslint-rules](https://github.com/buzinas/tslint-eslint-rules)
* [codelyzer](https://github.com/mgechev/codelyzer)

## Composability

> Composability is a way to combine smaller parts to make one large thing. Sort of [like Voltron®](http://25.media.tumblr.com/tumblr_m1zllfCJV21r8gq9go11_250.gif)

> — Yeoman docs

Just plug in tslint into your generator and let it setup your tslint.json and install required devDependencies for you. Everybody wins.

### Install

    npm install --save generator-tslint

### Compose

```js
this.composeWith('tslint', { options:  {
    'skip-install': this.options['skip-install'],
    config: {
        rulesDirectory: [
            'tslint-microsoft-contrib'
            , 'tslint-eslint-rules'
            , 'codelyzer'
        ]
}}}, {
  local: require.resolve('generator-tslint')
});
```

## License

MIT © Aleksandr Filatov [alfilatov.com](http://alfilatov.com)

[npm-url]: https://npmjs.org/package/generator-tslint
[npm-image]: https://img.shields.io/npm/v/generator-tslint.svg?style=flat-square

[travis-url]: https://travis-ci.org/greybax/generator-tslint
[travis-image]: https://img.shields.io/travis/greybax/generator-tslint/master.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/greybax/generator-tslint
[coveralls-image]: https://img.shields.io/coveralls/greybax/generator-tslint/master.svg?style=flat-square

[depstat-url]: https://david-dm.org/greybax/generator-tslint
[depstat-image]: https://david-dm.org/greybax/generator-tslint.svg?style=flat-square

[depstat-dev-url]: https://david-dm.org/greybax/generator-tslint#info=devDependencies
[depstat-dev-image]: https://david-dm.org/greybax/generator-tslint/dev-status.svg?style=flat-square