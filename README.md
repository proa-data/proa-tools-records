# Proa Tools Records

Management (pagination and ordering) of records within tables using mainly AngularJS and Bootstrap 3.

## Installation

```powershell
bower install proa-tools-records
```

## Usage

Everything are AngularJS directives as a attributes:

### Pagination

Both directives are required to paginate.

#### `ptList`

Located in a `table` tag, you have to bind here your array (scope variable).

#### `ptItem`

Represents an object name (defaults to `$item`) of the items. Put it in a `tr` and then print its properties (in `td`s).

### Ordering

It needs the previous directives.

#### `ptOrder`

To sorting a column, insert it with a property name in a `th` of table heading. This creates an interactive button with 3 clicks (ascending, descending and null order).