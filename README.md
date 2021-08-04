# Proa Tools Records

Control (pagination, ordering, data exporting and management) of records within tables using mainly AngularJS and Bootstrap 3.

## Installation

```bash
bower install proa-tools-records
```

## Usage

There are AngularJS directives as attributes and several simple HTML attrs.:

### Pagination

It can be disabled and restored (enabled) clicking a certain button. By default, at the beginning, activated; but it is possible to start disabled (with `pt-no-pagination` attribute).

Both directives are required to paginate:

#### `ptList`

Located in a `table` tag, you have to bind here an [expression](https://docs.angularjs.org/guide/expression) (often an easy scope variable) that results an array.

#### `ptItem`

Represents an object name (defaults to `$item`) of the items. Put it in a `tr` and then print its properties (in `td`s).

### Ordering

It needs the previous (pagination) directives.

#### `ptOrder`

To sorting a column, insert it with a property name in a `th` of table heading. This creates an interactive button with 3 clicks (ascending, descending and null order).

#### `pt-order-init`

In the beginning, you can indicate the initial and unique order (ascending or descending) of a column through this attribute (with `asc` or `desc` values, respectively).

### Data exporting

It allows to get a Excel file from the currently-visible table data.

#### `pt-filename`

Contains the spreadsheet filename.

### Management

It is possible (optionally) to edit and delete each item.

#### `ptItemManage`

An object (property on scope) is passed here. It must to be formed by one or two functions: `edit` and/or `delete`.

#### `pt-item-manage-output`

Place on HTML elements (usually interpolated `span`s) that have to be hidden in editing mode.

#### `pt-item-manage-input`

The opposite: Form controls (`input`, `select`, `textarea`...) are displayed when editing.

### Sticky tables

You can make the table cells of head and foot always visible. In order to this, only one CSS class name is needed:

#### `table-sticky`

Place in the `table-responsive` table containers.