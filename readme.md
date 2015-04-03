component-sort-table 
====================

A custom element for quickly generating HTML tables with sortable
columns:

    <sort-table sortable classes="string">
      District,Population,Households,White,Hispanic,Black
      One,91678,41195,62989,8979,6094
      Two,92281,34401,28556,8667,18388
      Three,91197,46839,62237,5926,9596
      Four,93874,39907,68570,4648,2194
      Five,90114,41744,61893,6587,5092
      Six,88763,42240,74044,4267,1444
      Seven,86024,50112,64780,4949,3662
    </sort-table>

`<sort-table>` was built using the Seattle Times' [web component
template](https://github.com/seattletimes/component-template).

Configuration 
-------------

In its simplest form, `<sort-table>` can be used to feed CSV-formatted
data to a static table by wrapping the data in a custom element tag. By
default, `<sort-table>` will generate a static (non-sortable) table with
the first row of data formatted as a header row.

The table can be further configured with several custom attributes:

-   `noheader` - for tables that do not have a header row
-   `sortable` - enables sortable columns (only works if table has a
    header row); by default, all columns will be sortable
-   `sortable="Foo,Bar,Baz"` - allows users to specify only certain
    column headers to be sortable
-   `classes="foo bar,foo,,,bar"` - allows users to include custom
    styling by adding comma-separated sets of classes to their
    corresponding columns
    -   `string` class - left aligns column headers and cell text (by
        default, headers and cell text are right-aligned)
    -   `mobile-hidden`, `tablet-hidden` classes - hide specified columns on mobile devices (480px default breakpoint for mobile, 768px for tablet)
    -   Users are also able to include their own custom classes

Extras 
------

Since `<sort-table>` is built to read CSV-formatted data, raw numeric
data should not include commas. Numbers are automatically formatted
during processing.
