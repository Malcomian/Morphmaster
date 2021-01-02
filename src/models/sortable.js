/**
 * Sortable
 * ---
 * A utility script for filtering a table of html elements
 * - click on the nearest th element to sort by a column
 * - th elements will toggle a 'selected' class when clicked (useful for showing/hiding th icons)
 * - if a td element has the 'num' class, interpret it as a number when sorting
 * - if a td element has the 'input' class, interpret it as the value of the input
 * - only targets the closest table to the given table selector - apply css selectors with caution
 * ---
 * ```javascript
 * // ex:
 * sortable('#myTable-search', '#myTable-table')
 * ```
 * @param {String} search_selector selector string for the target search input field
 * @param {String} table_selector selector string for the target table
 */
function sortable(search_selector, table_selector) {
  $(search_selector).on('keyup', function () {
    var value = $(this).val().toLowerCase();
    let filter_table_selector = `${table_selector} tbody tr`
    $(filter_table_selector).filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });

  $(`${table_selector} th`).on('click', function () {
    console.log(`sorting...`)
    var $th = $(this).closest('th'); // get the selected th
    $th.toggleClass('selected'); // toggle selected class on th
    var isSelected = $th.hasClass('selected'); // create reference to the selected th
    var isInput = $th.hasClass('input'); // this may be for input fields inside of columns - a table header with the "input" class expects that column to interpret the values of the input fields within its respective cell
    var column = $th.index(); // position number of target column
    // let target_table = `table${table_selector}` // must be a table or else the script doesn't work - this morphs the selector to ensure functionality... maybe it's not needed?
    var $table = $th.closest(table_selector); // get closest table to table selector (can also be the preceeding target_table variable)
    var isNum = $table.find('tbody > tr').children('td').eq(column).hasClass('num'); // if the td has the num class, interpret as number
    var rows = $table.find('tbody > tr').get(); // get all rows
    rows.sort(function (rowA, rowB) {
      if (isInput) {
        var keyA = $(rowA).children('td').eq(column).children('input').val().toUpperCase();
        var keyB = $(rowB).children('td').eq(column).children('input').val().toUpperCase();
      } else {
        var keyA = $(rowA).children('td').eq(column).text().toUpperCase();
        var keyB = $(rowB).children('td').eq(column).text().toUpperCase();
      }
      if (isSelected) return OrderBy(keyA, keyB, isNum);
      return OrderBy(keyB, keyA, isNum);
    });
    $.each(rows, function (index, row) {
      $table.children('tbody').append(row);
    });
    return false;
  });
}

function OrderBy(a, b, n) {
  if (n) return a - b;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

module.exports = sortable