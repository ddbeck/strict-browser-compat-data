[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

This work has become part of the [web-features](https://github.com/web-platform-dx/web-features/) project.
If you need to work with browser compat data, or using and generating Baseline statuses, go there.

<details>

<summary>Old documentation</summary>

## Before you begin.

1. `npm install`
2. If needed, upgrade BCD to the latest release. `npm install --save-peer @mdn/browser-compat-data@latest`.

## Usage

### Get help

`$ npx tsx ./scripts/baseline/ --help`

### Get the status for a BCD key

`$ npx tsx ./scripts/baseline/ css.properties.border-color`

### Get a pretty Markdown version

`$ npx tsx ./scripts/baseline/ --markdown css.properties.border-color`

### Check multiple keys, as if you had created a group

`$ npx tsx ./scripts/baseline/ --markdown --group-as hypothetical-feature css.properties.border-color javascript.builtins.Temporal`

### Check a tag in BCD

`$ npx tsx ./scripts/baseline/ --markdown --from-tags web-features:grid`

### See what an update web-features YAML file would look like

`$ npx tsx ./scripts/baseline/ update-feature ../web-platform-dx-web-features/feature-group-definitions/flexbox.yml`

### Write the update to the YAML file

`$ npx tsx ./scripts/baseline/ update-feature ../web-platform-dx-web-features/feature-group-definitions/flexbox.yml --write`

</details>
