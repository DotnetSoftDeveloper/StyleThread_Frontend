import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  SortDirection
} from "@tanstack/react-table";

import "./ProductList.css";
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaBoxOpen,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import { TiArrowSortedUp, TiArrowSortedDown, TiArrowUnsorted } from "react-icons/ti";
import Loader from "../../Shared/Loader";
import { fetchProducts } from "../../Store/EntitySlices";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState, AppDispatch } from "../../Store/ConfigureStore";
import { Product } from "../../Types/Interface/IProduct";

/* ── helpers ─────────────────────────────────────────────────── */
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const minPrice = (product: Product) => {
  const prices = product.productVariants?.map((v) => v.price).filter(Boolean);
  return prices?.length ? Math.min(...prices) : 0;
};

const priceRange = (product: Product) => {
  const prices = product.productVariants?.map((v) => v.price).filter(Boolean);
  if (!prices || prices.length === 0) return "—";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? `₹${min.toFixed(2)}`
    : `₹${min.toFixed(2)} – ₹${max.toFixed(2)}`;
};

const totalInventory = (product: Product) =>
  product.productVariants?.reduce((sum, v) => sum + (v.inventory ?? 0), 0) ?? 0;

const stockBadge = (qty: number) => {
  if (qty === 0) return <span className="pl-badge pl-badge--out">Out of Stock</span>;
  if (qty < 10)  return <span className="pl-badge pl-badge--low">Low ({qty})</span>;
  return <span className="pl-badge pl-badge--in">{qty} in stock</span>;
};

const SortIcon = ({ dir }: { dir: SortDirection | false }) => {
  if (dir === "asc")  return <TiArrowSortedUp  className="pl-sort-icon pl-sort-icon--active" />;
  if (dir === "desc") return <TiArrowSortedDown className="pl-sort-icon pl-sort-icon--active" />;
  return <TiArrowUnsorted className="pl-sort-icon" />;
};

/* ── component ───────────────────────────────────────────────── */
const ProductList: React.FC = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const navigate   = useNavigate();
  const location   = useLocation();

  const products   = useSelector((state: RootState) => state.products?.list as Product[]);
  const totalCount = useSelector((state: RootState) => (state.products as any)?.totalCount as number ?? 0);
  const loading    = useSelector((state: RootState) => state.products?.loading as boolean);

  /* ── pagination state ── */
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize,   setPageSize]   = useState(10);

  /* ── sorting state ── */
  const [sorting, setSorting] = useState<SortingState>([]);

  /* ── search (client-side within the current page) ── */
  const [search, setSearch] = useState("");

  const effectiveTotalCount = totalCount > 0 ? totalCount : (products?.length ?? 0);
  const totalPages = Math.max(1, Math.ceil(effectiveTotalCount / pageSize));

  /* ── fetch whenever page or size changes ── */
  useEffect(() => {
    dispatch(fetchProducts({ pageNumber, pageSize }));
  }, [dispatch, pageNumber, pageSize]);

  /* ── reset to page 1 when page size changes ── */
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handleEdit = (product: Product) => {
    if (location.pathname.startsWith("/admin")) {
      navigate(`/admin/products/edit/${product.productId}`, { state: { product } });
    } else {
      navigate(`/editProduct/${product.productId}`, { state: { product } });
    }
  };

  const handleDelete = (productId: number) =>
    console.log("Delete product with ID:", productId);

  /* ── columns ── */
  const columns: ColumnDef<Product, unknown>[] = [
    {
      header: "#",
      id: "index",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="pl-row-num">
          {(pageNumber - 1) * pageSize + row.index + 1}
        </span>
      )
    },
    {
      header: "SKU",
      accessorKey: "sku",
      id: "sku",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="pl-sku" title={getValue() as string}>{getValue() as string}</span>
      )
    },
    {
      header: "Product",
      accessorKey: "name",
      id: "name",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="pl-name-cell" title={`${row.original.name}\n${row.original.description || ""}`}>
          <div className="pl-product-icon"><FaBoxOpen /></div>
          <div className="pl-name-content">
            <div className="pl-name">{row.original.name}</div>
            {row.original.description && (
              <div className="pl-desc">{row.original.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Price",
      id: "price",
      enableSorting: true,
      accessorFn: (row) => minPrice(row),
      cell: ({ row }) => (
        <span className="pl-price">{priceRange(row.original)}</span>
      )
    },
    {
      header: "Variants",
      id: "variants",
      enableSorting: true,
      accessorFn: (row) => row.productVariants?.length ?? 0,
      cell: ({ row }) => {
        const count = row.original.productVariants?.length ?? 0;
        return (
          <span className="pl-variants">
            {count} {count === 1 ? "var" : "vars"}
          </span>
        );
      }
    },
    {
      header: "Stock",
      id: "inventory",
      enableSorting: true,
      accessorFn: (row) => totalInventory(row),
      cell: ({ row }) => stockBadge(totalInventory(row.original))
    },
    {
      header: "Listed On",
      accessorKey: "listedOn",
      id: "listedOn",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="pl-date">{formatDate(getValue() as string)}</span>
      )
    },
    {
      header: "Listed By",
      accessorKey: "listedBy",
      id: "listedBy",
      enableSorting: true,
      cell: ({ getValue }) => {
        const val = (getValue() as string) || "—";
        return (
          <div className="pl-listed-by" title={val}>
            <span className="pl-avatar">{val.charAt(0).toUpperCase()}</span>
            <span className="pl-listed-by-name">{val}</span>
          </div>
        );
      }
    },
    {
      header: "Actions",
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="pl-actions">
          <button
            className="pl-btn pl-btn--edit"
            onClick={() => handleEdit(row.original)}
            title="Edit product"
            aria-label="Edit product"
          >
            <FaEdit /><span>Edit</span>
          </button>
          <button
            className="pl-btn pl-btn--delete"
            onClick={() => handleDelete(row.original.productId)}
            title="Delete product"
            aria-label="Delete product"
          >
            <FaTrash /><span>Del</span>
          </button>
        </div>
      )
    }
  ];

  /* ── filtered rows (client-side search within current page) ── */
  const filteredRows = search.trim()
    ? products.filter((p) =>
        [p.name, p.sku, p.description].some((f) =>
          f?.toLowerCase().includes(search.toLowerCase())
        )
      )
    : products;

  /* ── ensure displayed rows strictly respect pageSize ── */
  const pagedRows = React.useMemo(() => {
    if (!filteredRows || filteredRows.length === 0) return [];
    if (filteredRows.length > pageSize) {
      const startIndex = (pageNumber - 1) * pageSize;
      return filteredRows.slice(startIndex, startIndex + pageSize);
    }
    return filteredRows;
  }, [filteredRows, pageNumber, pageSize]);

  const table = useReactTable({
    columns,
    data: pagedRows,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages
  });

  /* ── page range display ── */
  const from = effectiveTotalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const to   = Math.min(pageNumber * pageSize, effectiveTotalCount);

  /* ── page number buttons ── */
  const pageButtons = () => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (pageNumber > 3) pages.push("…");
      for (
        let i = Math.max(2, pageNumber - 1);
        i <= Math.min(totalPages - 1, pageNumber + 1);
        i++
      ) pages.push(i);
      if (pageNumber < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pl-container">

      {/* ── Header ── */}
      <div className="pl-header">
        <div className="pl-header-left">
          <h2 className="pl-title">Product List</h2>
          {effectiveTotalCount > 0 && (
            <span className="pl-count">{effectiveTotalCount} total products</span>
          )}
        </div>
        <button className="pl-add-btn" onClick={() => navigate("/addProduct")}>
          <FaPlus className="pl-add-btn-icon" />
          Add Product
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="pl-toolbar">
        <div className="pl-search-box">
          <FaSearch className="pl-search-icon" />
          <input
            type="text"
            placeholder="Search on this page by name, SKU or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-search-input"
          />
          {search && (
            <button className="pl-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <div className="pl-page-size-select">
          <label className="pl-page-size-label">Rows per page</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="pl-page-size-dropdown"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {sorting.length > 0 && (
          <button className="pl-reset-sort" onClick={() => setSorting([])}>
            Clear sort
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="pl-loader"><Loader /></div>
      ) : (
        <>
          <div className="pl-table-wrapper">
            <table className="pl-table">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((col) => {
                      const canSort = col.column.getCanSort();
                      const sorted  = col.column.getIsSorted();
                      return (
                        <th
                          key={col.id}
                          className={`pl-col-${col.id} ${canSort ? "pl-th-sortable" : ""}`}
                          onClick={canSort ? col.column.getToggleSortingHandler() : undefined}
                          title={
                            canSort
                              ? sorted === "asc"  ? "Sort descending"
                              : sorted === "desc" ? "Clear sort"
                              : "Sort ascending"
                              : undefined
                          }
                        >
                          <span className="pl-th-inner">
                            {flexRender(col.column.columnDef.header, col.getContext())}
                            {canSort && <SortIcon dir={sorted} />}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="pl-empty">
                      No products match your search.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const header = cell.column.columnDef.header;
                        const label = typeof header === "string" ? header : cell.column.id;
                        return (
                          <td
                            key={cell.id}
                            className={`pl-col-${cell.column.id}`}
                            data-label={label}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination bar ── */}
          <div className="pl-pagination">
            <span className="pl-pagination-info">
              {effectiveTotalCount === 0
                ? "No results"
                : `Showing ${from}–${to} of ${effectiveTotalCount} products`}
            </span>

            <div className="pl-pagination-controls">
              {/* First */}
              <button
                className="pl-page-btn"
                onClick={() => setPageNumber(1)}
                disabled={pageNumber === 1}
                title="First page"
              >
                <FaAngleDoubleLeft />
              </button>

              {/* Prev */}
              <button
                className="pl-page-btn"
                onClick={() => setPageNumber((p) => p - 1)}
                disabled={pageNumber === 1}
                title="Previous page"
              >
                <FaChevronLeft />
              </button>

              {/* Page numbers */}
              {pageButtons().map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="pl-page-ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`pl-page-btn pl-page-num${pageNumber === p ? " pl-page-btn--active" : ""}`}
                    onClick={() => setPageNumber(p as number)}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                className="pl-page-btn"
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber === totalPages}
                title="Next page"
              >
                <FaChevronRight />
              </button>

              {/* Last */}
              <button
                className="pl-page-btn"
                onClick={() => setPageNumber(totalPages)}
                disabled={pageNumber === totalPages}
                title="Last page"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;
