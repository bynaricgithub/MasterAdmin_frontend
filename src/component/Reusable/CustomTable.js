import {
  faSearch,
  faTable,
  faThLarge,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Pagination } from "react-bootstrap";

const DataTable = ({
  data = [],
  columns = [],
  keyField,
  gridViewEnabled = true,
  searchEnabled = true,
  entriesEnabled = true,
  paginationEnabled = true,
  customPageSize = 10, // default page size
}) => {
  const [gridView, setGridView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(customPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  // Search and Sort Data
  useEffect(() => {
    let updatedData = [...data];

    // Apply Search Filter
    if (searchQuery) {
      updatedData = updatedData.filter((row) =>
        Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Apply Sorting
    if (sortConfig.key) {
      updatedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(updatedData);
  }, [searchQuery, sortConfig, data]);

  // Pagination Data
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handle Sorting on Column Click
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Column Alignment Style
  const getColumnAlignmentStyle = (align) => {
    switch (align) {
      case "center":
        return { textAlign: "center" };
      case "right":
        return { textAlign: "right" };
      default:
        return { textAlign: "left" };
    }
  };

  return (
    <div className="m-3 table-responsive">
      <div className="responsive-table-component card p-3">
        {/* Toolbar */}
        <div className="toolbar d-flex justify-content-between mb-3 align-items-center">
          {/* Entries Dropdown */}
          {entriesEnabled && (
            <div className="entries-dropdown d-flex align-items-center">
              <label htmlFor="pageSize" className="me-1">
                Show:
              </label>
              <select
                id="pageSize"
                className="form-select d-inline-block w-auto"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          )}

          {/* Search Bar */}
          {searchEnabled && (
            <div className="d-flex align-items-center">
              <div className="input-group me-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ maxWidth: "250px", height: "38px" }}
                />
                <button
                  className="btn btn-primary"
                  style={{ top: "0px", borderRadius: "4px", right: "0px" }}
                >
                  <FontAwesomeIcon
                    icon={faSearch}
                    style={{ fontSize: "12px" }}
                  />
                </button>
              </div>

              {/* Toggle Button for Grid/Table View */}
              {gridViewEnabled && (
                <button
                  className="btn btn-primary toggle-button"
                  onClick={() => setGridView(!gridView)}
                  style={{ height: "40px" }}
                >
                  <FontAwesomeIcon icon={gridView ? faTable : faThLarge} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table View */}
        <div
          className={`responsiveTable table-responsive ${
            gridView ? "d-none" : ""
          }`}
        >
          <table className="table table-bordered">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.dataField}
                    onClick={() => handleSort(column.dataField)}
                    style={getColumnAlignmentStyle(column.align)}
                    className="sortable"
                  >
                    {column.text}
                    {sortConfig.key === column.dataField &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIndex) => (
                <tr key={row[keyField] || rowIndex}>
                  {columns.map((column) => (
                    <td
                      key={column.dataField}
                      style={getColumnAlignmentStyle(column.align)}
                    >
                      {row[column.dataField]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grid View */}
        <div className={`gridView ${!gridView ? "d-none" : ""}`}>
          <div className="row">
            {paginatedData.map((row, rowIndex) => (
              <div key={rowIndex} className="col-md-4 mb-4">
                <div className="card cardItem">
                  <div className="card-body">
                    {columns.map((column, colIndex) => (
                      <p
                        key={colIndex}
                        className="card-text"
                        style={getColumnAlignmentStyle(column.align)}
                      >
                        <strong>{column.text}:</strong> {row[column.dataField]}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {paginationEnabled && (
          <div className="d-flex justify-content-between align-items-center pagination-container">
            <Pagination className="mb-0">
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
            <span className="pagination-info font-14">
              <small>
                ({startIndex + 1} - {startIndex + paginatedData.length})
              </small>{" "}
              of <b>{filteredData.length} entries</b>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
