# Proa Tools Records

Management (pagination, data exporting and ordering) of records within tables using mainly AngularJS and Bootstrap 3.

## Installation

```powershell
bower install proa-tools-records
```

## Usage

There are AngularJS directives as attributes and one simple HTML attr.:

### Pagination

It can be disabled and restored (enabled) clicking a certain button. By default, at the beginning, activated; but it is possible to start disabled (with `pt-no-pagination` attribute).

Both directives are required to paginate:

#### `ptList`

Located in a `table` tag, you have to bind here your array (scope variable).

#### `ptItem`

Represents an object name (defaults to `$item`) of the items. Put it in a `tr` and then print its properties (in `td`s).

### Data exporting

It allows to get a Excel file from the currently-visible table data. It is optional and activated if `pt-export` attribute appears:

#### `ptExport`

Contains the spreadsheet filename.

### Ordering

It needs the previous (pagination) directives.

#### `ptOrder`

To sorting a column, insert it with a property name in a `th` of table heading. This creates an interactive button with 3 clicks (ascending, descending and null order).