# Proa Tools Records

Control (pagination, management, data exporting and ordering) of records within tables using mainly AngularJS and Bootstrap 3.

## Installation

```powershell
bower install proa-tools-records
```

## Usage

There are AngularJS directives as attributes and several simple HTML attrs.:

### Pagination

It can be disabled and restored (enabled) clicking a certain button. By default, at the beginning, activated; but it is possible to start disabled (with `pt-no-pagination` attribute).

Both directives are required to paginate:

#### `ptList`

Located in a `table` tag, you have to bind here your array (scope variable).

#### `ptItem`

Represents an object name (defaults to `$item`) of the items. Put it in a `tr` and then print its properties (in `td`s).

### Management

It is possible (optionally) to edit and delete each item.

#### `ptItemManage`

An object (property on scope) is passed here. It must to be formed by one or two functions: `edit` and/or `delete`.

#### `ptItemManageOutput`

Put on HTML element (usually an interpolated `span`) that have to be hidden in editing mode.

#### `ptItemManageInput`

The opposite: form controls (`input`, `select`, `textarea`...) is shown when the edition.

### Data exporting

It allows to get a Excel file from the currently-visible table data.

#### `ptFilename`

Contains the spreadsheet filename.

### Ordering

It needs the previous (pagination) directives.

#### `ptOrder`

To sorting a column, insert it with a property name in a `th` of table heading. This creates an interactive button with 3 clicks (ascending, descending and null order).