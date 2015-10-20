# Tink popover Angular directive

v1.0.3

## What is this repository for?

The Tink popover Angular directive provides you with a nice popover component.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

   `bower install tink-popover-angular --save`

2. Add the following files to your project:

   `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

   `<script src="bower_components/tink-popover-angular/dist/tink-popover-angular.js"></script>`

3. Add `tink.popover` to your app module's dependency.

   `angular.module('myApp', ['tink.popover']);`



----------



## How to use

### tink-popover

To use this directive you have to add `tink-popover` to the element of your choice and assign the content to `tink-popover-template`.

You can use the `tink-popover-place` and `tink-popover-align` options to position the popover container to your liking, however screen calculation will be applied to optimize the display of the popover, possibly overruling your set placement.

```html
<button tink-popover="" tink-popover-place="left" tink-popover-align="bottom" tink-popover-template="views/popover-template.html">Left Popover</button>
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-tink-popover-place | `string` | `''` | Defines where the popover will show. Possible values are `top`, `left`, `right` or `bottom`.
data-tink-popover-align | `string` | `''` | Alignment of the popover to the element. Possible values are `left`, `center`, `right`, `top` or `bottom.
data-tink-arrow | `boolean` | `true` | Whether the popover arrow is shown or not.
tink-popover-template | `string` | `''` | The url of the popover template.

### Example

A working example can be found in [the Tink documentation](http://tink.digipolis.be/#/docs/directives/popover#example).

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)
