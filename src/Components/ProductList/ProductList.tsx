import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useTable, useFilters, Column } from "react-table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender
} from "@tanstack/react-table";

import "./ProductList.css";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import Loader from "../../Shared/Loader";
import { fetchProducts } from "../../Store/EntitySlices";
import { useNavigate } from "react-router-dom";
import { Button } from "../Atoms/Button";
import { RootState, AppDispatch } from "../../Store/ConfigureStore";
import { Product } from "../../Types/Interface/IProduct";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const products = useSelector((state: RootState) => state.products?.list as Product[]);

  useEffect(() => {
    console.log("Products from Redux:", products);
    if (products.length === 0) {
      dispatch(fetchProducts(undefined));
    }
  }, [dispatch, products]);

  const handleEdit = (product: Product) => {
    navigate(`/editProduct/${product.productId}`, {
      state: { product }
    });
  };

  const handleDelete = (productId: number) => {
    console.log("Delete product with ID:", productId);
  };

  const columns: ColumnDef<Product, unknown>[] = [
    {
      header: "SKU",
      accessorKey: "sku"
    },
    {
      header: "Name",
      accessorKey: "name"
    },
    {
      header: "Description",
      accessorKey: "description"
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: ({ row }) => (
        <div className="action-buttons">
          <button
            className="btn btn-edit"
            onClick={() => handleEdit(row.original)}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-delete"
            onClick={() => handleDelete(row.original.productId)}
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="add-product-container">
      <div className="col-12 row">
        <div className="col-10">
          <h2>Product List</h2>
        </div>
        <div className="col-2 mt-2">
          <Button
            label={
              <>
                <FaPlus className="icon" /> &nbsp; Add Product
              </>
            }
            onClick={() => navigate("/addProduct")}
            className="primary"
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="center-loader">
          <Loader />
        </div>
      ) : (
        <table className="product-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th key={column.id}>
                    {flexRender(
                      column.column.columnDef.header,
                      column.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;
