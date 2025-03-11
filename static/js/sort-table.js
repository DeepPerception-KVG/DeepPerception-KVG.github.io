/**
 * sort-table.js
 * A pure JavaScript (no dependencies) solution to make HTML
 *  Tables sortable
 *
 * Copyright (c) 2013 Tyler Uebele
 * Released under the MIT license.  See included LICENSE.txt
 *  or http://opensource.org/licenses/MIT
 *
 * latest version available at https://github.com/tyleruebele/sort-table
 */

/**
 * Sort the rows in a HTML Table
 *
 * @param Table The Table DOM object
 * @param col   The zero-based column number by which to sort
 * @param dir   Optional. The sort direction; pass 1 for asc; -1 for desc
 * @returns void
 */




// 分页配置
const totalPages = 4; // 总页数，根据实际表格数量调整
let currentPage = 1;

// 显示指定页码的表格，并隐藏其他表格
function showPage(page) {
  for (let i = 1; i <= totalPages; i++) {
    const tableContainer = document.getElementById(`tablePage${i}`);
    if (i === page) {
      tableContainer.style.display = '';
    } else {
      tableContainer.style.display = 'none';
    }
  }
  currentPage = page;
  updatePagination();
}

// 更新分页控件的状态和页码按钮
function updatePagination() {
    // 更新上一页和下一页按钮状态
    document.getElementById('prevPage').classList.toggle('is-disabled', currentPage === 1);
    document.getElementById('nextPage').classList.toggle('is-disabled', currentPage === totalPages);
  
    // 高亮当前页码并生成页码按钮
    const paginationList = document.getElementById('paginationList');
    paginationList.innerHTML = ''; // 确保清除旧的分页点
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.classList.add('pagination-link');
      if (i === currentPage) {
        a.classList.add('is-current');
        a.setAttribute('aria-current', 'page');
      }
      a.href = '#';
      a.innerText = i;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(i);
      });
      li.appendChild(a);
      paginationList.appendChild(li);
    }
  }
// 绑定分页按钮事件
document.getElementById('prevPage').addEventListener('click', (e) => {
  e.preventDefault();
  if (currentPage > 1) {
    showPage(currentPage - 1);
  }
});

document.getElementById('nextPage').addEventListener('click', (e) => {
  e.preventDefault();
  if (currentPage < totalPages) {
    showPage(currentPage + 1);
  }
});

// 初始化显示第一页
document.addEventListener('DOMContentLoaded', () => {
    showPage(1);
    // 默认按 "Overall" 列从大到小排序
    const table = document.querySelector('table.js-sort-table');
    if (table) {
      sortTable(table, 5, -1); // 假设 "Overall" 列的索引是2
    }
    for (let i = 1; i <= totalPages; i++) {
      const table = document.getElementById(`results${i}`);
      if (table) {
        // 确保表格已经初始化
        if (!table.getAttribute('data-js-sort-table')) {
          sortTable.init();
        }
        // 执行排序，5是Overall列索引，-1表示降序
        sortTable(table, 5, -1);
      }
    }
  });



  function sortTable(Table, col, dir) {
    var sortClass, i;
  
    // 获取之前的排序列
    Table.sortCol = -1;
    sortClass = Table.className.match(/js-sort-\d+/);
    if (null != sortClass) {
      Table.sortCol = parseInt(sortClass[0].replace(/js-sort-/, ''), 10);
      Table.className = Table.className.replace(new RegExp(' ?' + sortClass[0] + '\\b'), '');
    }
    // 如果未传入排序列，使用之前的排序列
    if ('undefined' === typeof col) {
      col = Table.sortCol;
    }
  
    if ('undefined' !== typeof dir) {
      // 接受 -1 或 'desc' 作为降序，其余为升序
      Table.sortDir = dir == -1 || dir == 'desc' ? -1 : 1;
    } else {
      // 如果未传入排序方向，使用之前的相反方向
      sortClass = Table.className.match(/js-sort-(a|de)sc/);
      if (null != sortClass && Table.sortCol == col) {
        Table.sortDir = 'js-sort-asc' == sortClass[0] ? -1 : 1;
      } else {
        Table.sortDir = 1;
      }
    }
    Table.className = Table.className.replace(/ ?js-sort-(a|de)sc/g, '');
  
    // 更新排序列
    Table.className += ' js-sort-' + col;
    Table.sortCol = col;
  
    // 更新排序方向
    Table.className += ' js-sort-' + (Table.sortDir == -1 ? 'desc' : 'asc');
  
    // 获取排序类型
    if (col < Table.tHead.rows[Table.tHead.rows.length - 1].cells.length) {
      sortClass = Table.tHead.rows[Table.tHead.rows.length - 1].cells[col].className.match(/js-sort-[-\w]+/);
    }
    // 支持跨列头
    for (i = 0; i < Table.tHead.rows[Table.tHead.rows.length - 1].cells.length; i++) {
      if (col == Table.tHead.rows[Table.tHead.rows.length - 1].cells[i].getAttribute('data-js-sort-colNum')) {
        sortClass = Table.tHead.rows[Table.tHead.rows.length - 1].cells[i].className.match(/js-sort-[-\w]+/);
      }
    }
    if (null != sortClass) {
      Table.sortFunc = sortClass[0].replace(/js-sort-/, '');
    } else {
      Table.sortFunc = 'string';
    }
    // 设置活动列的样式
    Table.querySelectorAll('.js-sort-active').forEach(function(Node) {
      Node.className = Node.className.replace(/ ?js-sort-active\b/, '');
    });
    Table.querySelectorAll('[data-js-sort-colNum="' + col + '"]:not(:empty)').forEach(function(Node) {
      Node.className += ' js-sort-active';
    });
  
    // 排序
    var rows = [],
        TBody = Table.tBodies[0];
  
    for (i = 0; i < TBody.rows.length; i++) {
      rows[i] = TBody.rows[i];
    }
    if ('none' != Table.sortFunc) {
      rows.sort(function(RowA, RowB) {
        var valA, valB;
        if ('function' != typeof sortTable[Table.sortFunc]) {
          Table.sortFunc = 'string';
        }
        valA = sortTable[Table.sortFunc](RowA.cells[Table.sortCol]);
        valB = sortTable[Table.sortFunc](RowB.cells[Table.sortCol]);
  
        return valA == valB ? 0 : Table.sortDir * (valA > valB ? 1 : -1);
      });
    }
  
    while (TBody.firstChild) {
      TBody.removeChild(TBody.firstChild);
    }
    for (i = 0; i < rows.length; i++) {
      TBody.appendChild(rows[i]);
    }
  }

/**
 * Compare two table rows based on current settings
 *
 * @param RowA A TR DOM object
 * @param RowB A TR DOM object
 * @returns {number} 1 if RowA is greater, -1 if RowB, 0 if equal
 */
sortTable.compareRow = function(RowA, RowB) {
    var valA, valB;
    if ('function' != typeof sortTable[sortTable.sortFunc]) {
        sortTable.sortFunc = 'string';
    }
    valA = sortTable[sortTable.sortFunc](RowA.cells[sortTable.sortCol]);
    valB = sortTable[sortTable.sortFunc](RowB.cells[sortTable.sortCol]);

    return valA == valB ? 0 : sortTable.sortDir * (valA > valB ? 1 : -1);
};

/**
 * Strip all HTML, no exceptions
 * @param html
 * @returns {string}
 */
sortTable.stripTags = function(html) {
    replace_unit = (s) => {
        let iUnit = (s.indexOf('M') > -1) ? s.indexOf('M') : s.indexOf('B');
        if (iUnit == -1) return s;
        let unit = s[iUnit];
        let val = Number(s.substring(0, iUnit));
        if (isNaN(val)) return s;
        val *= (unit == 'M') ? 1000000 : 1000000000;
        return val.toString();
    }
    html = replace_unit(html);
    return html.replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, '');
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Converts innerHTML to a timestamp, 0 for invalid dates
 *
 * @param Cell A TD DOM object
 * @returns {Number}
 */
sortTable.date = function(Cell) {
    // If okDate library is available, Use it for advanced Date processing
    if (typeof okDate !== 'undefined') {
        var kDate = okDate(sortTable.stripTags(Cell.innerHTML));
        return kDate ? kDate.getTime() : 0;
    } else {
        return (new Date(sortTable.stripTags(Cell.innerHTML))).getTime() || 0;
    }
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Converts innerHTML to a JS Number object
 *
 * @param Cell A TD DOM object
 * @returns {Number}
 */
sortTable.number = function(Cell) {
    return Number(sortTable.stripTags(Cell.innerHTML).replace(/[^-\d.]/g, ''));
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Converts innerHTML to a lower case string for insensitive compare
 *
 * @param Cell A TD DOM object
 * @returns {String}
 */
sortTable.string = function(Cell) {
    return sortTable.stripTags(Cell.innerHTML).toLowerCase();
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 *
 * @param Cell A TD DOM object
 * @returns {String}
 */
sortTable.raw = function(Cell) {
    return Cell.innerHTML;
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Captures the last space-delimited token from innerHTML
 *
 * @param Cell A TD DOM object
 * @returns {String}
 */
sortTable.last = function(Cell) {
    return sortTable.stripTags(Cell.innerHTML).split(' ').pop().toLowerCase();
};

/**
 * Helper function that converts a table cell (TD) to a comparable value
 * Captures the value of the first childNode
 *
 * @param Cell A TD DOM object
 * @returns {String}
 */
sortTable.input = function(Cell) {
    for (var i = 0; i < Cell.children.length; i++) {
        if ('object' == typeof Cell.children[i]
            && 'undefined' != typeof Cell.children[i].value
        ) {
            return Cell.children[i].value.toLowerCase();
        }
    }

    return sortTable.string(Cell);
};

/**
 * Helper function that prevents sorting by always returning null
 *
 * @param Cell A TD DOM object
 * @returns null
 */
sortTable.none = function(Cell) {
    return null;
};

/**
 * Return the click handler appropriate to the specified Table and column
 *
 * @param Table Table to sort
 * @param col   Column to sort by
 * @returns {Function} Click Handler
 */
sortTable.getClickHandler = function(Table, col) {
    return function() {
        sortTable(Table, col);
    };
};

/**
 * Attach sortTable() calls to table header cells' onclick events
 * If the table(s) do not have a THead node, one will be created around the
 *  first row
 */
sortTable.init = function() {
    var THead, Tables, Handler;
    if (document.querySelectorAll) {
      Tables = document.querySelectorAll('table.js-sort-table');
    } else {
      Tables = document.getElementsByTagName('table');
    }
  
    for (var i = 0; i < Tables.length; i++) {
      // 防止重复处理
      if (Tables[i].getAttribute('data-js-sort-table') === 'true') {
        continue;
      }
  
      // 确保表格有thead元素
      if (!Tables[i].tHead) {
        THead = document.createElement('thead');
        THead.appendChild(Tables[i].rows[0]);
        Tables[i].insertBefore(THead, Tables[i].children[0]);
      } else {
        THead = Tables[i].tHead;
      }
  
      // 绑定点击事件到表头
      for (var rowNum = 0; rowNum < THead.rows.length; rowNum++) {
        var colNum = 0;
        for (var cellNum = 0; cellNum < THead.rows[rowNum].cells.length; cellNum++) {
          var cell = THead.rows[rowNum].cells[cellNum];
          var colspan = cell.colSpan || 1;
          var rowspan = cell.rowSpan || 1;
          if (cell.className.match(/\bjs-sort-none\b/)) {
            colNum += colspan;
            continue;
          }
          // 定义点击排序的列
          cell.setAttribute('data-js-sort-colNum', colNum);
          Handler = sortTable.getClickHandler(Tables[i], colNum);
          cell.addEventListener('click', Handler);
          colNum += colspan;
        }
      }
  
      // 标记表格已处理
      Tables[i].setAttribute('data-js-sort-table', 'true');
    }
  
    // 添加默认样式
    var element = document.createElement('style');
    document.head.insertBefore(element, document.head.childNodes[0]);
    var sheet = element.sheet;
    sheet.insertRule('table.js-sort-table.js-sort-asc thead tr > .js-sort-active:not(.js-sort-none):after {content: "\\25b2";font-size: 0.7em;padding-left: 3px;line-height: 0.7em;}', 0);
    sheet.insertRule('table.js-sort-table.js-sort-desc thead tr > .js-sort-active:not(.js-sort-none):after {content: "\\25bc";font-size: 0.7em;padding-left: 3px;line-height: 0.7em;}', 0);
  };
// Run sortTable.init() when the page loads
window.addEventListener
    ? window.addEventListener('load', sortTable.init, false)
    : window.attachEvent && window.attachEvent('onload', sortTable.init)
    ;

// Shim for IE11's lack of NodeList.prototype.forEach
if (typeof NodeList.prototype.forEach !== "function") {
    NodeList.prototype.forEach = Array.prototype.forEach;
}
