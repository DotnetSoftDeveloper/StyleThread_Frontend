import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchDropdowns, fetchProducts } from "../../Store/EntitySlices"; // import { FormGroup } from "../../Components/Atoms/FormGroup";
import { ProductVariantsList } from "../../Components/ProductVariantList/ProductVariantsList";
import "./AddProduct.css";
import { Checkbox } from "../../Components/Atoms/Checkbox";
import { Input } from "../../Components/Atoms/Input"; // Correct import statement
import { Button } from "../../Components/Atoms/Button";
import "react-toastify/dist/ReactToastify.css";
// import { ToastContainer } from "react-toastify";
import {
  Product,
  ProductVariant
  //  ProductVariantSize
} from "../../Types/Interface/IProduct";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import { FormGroup } from "../../Components/Atoms/FormGroup";
// import { DropdownOptions } from "../../Types/Interface/DropDown";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import Loader from "../../Components/Loader/Loader";

const AddProduct: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { product: initialProduct } = location.state || {};
  const { showToast } = useToast();
  const [loader, setLoading] = useState<boolean>(false);

  const [product, setProduct] = useState<Product>({
    productId: initialProduct?.productId || 0,
    sku: initialProduct?.sku || "",
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    categoryId: initialProduct?.categoryId || 0,
    brandId: initialProduct?.brandId || 0,
    listedOn: initialProduct?.listedOn || new Date().toISOString().slice(0, 10),
    listedBy: initialProduct?.listedBy || "Seller", // Fixed: Ensure listedBy is included
    fitId: initialProduct?.fitId || 0,
    fabricId: initialProduct?.fabricId || 0,
    sleeveId: initialProduct?.sleeveId || 0,
    reversible: initialProduct?.reversible || false,
    neckTypeId: initialProduct?.neckTypeId || 0,
    fabricCareId: initialProduct?.fabricCareId || 0,
    productVariants: initialProduct?.productVariants?.length
      ? initialProduct.productVariants.map((variant: ProductVariant) => ({
          productVariantId: variant.productVariantId || 0,
          productId: variant.productId || 0,
          // sizeIds: variant.productVariantSizes?.map((size: ProductVariantSize) => size.sizeId) || [],
          colorId: variant.colorId || 0,
          price: variant.price || "",
          salePrice: variant.salePrice || "",
          discount: variant.discount || 0,
          inventory: variant.inventory || "",
          image: variant.image || [""],
          productVariantSizes: variant.productVariantSizes || []
        }))
      : [
          {
            productVariantId: 0,
            productId: 0,
            // sizeIds: [],
            colorId: 0,
            price: "",
            salePrice: "",
            discount: 0,
            inventory: "",
            image: [""],
            productVariantSizes: []
          }
        ]
  });

  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  // const dropdowns = useSelector((state: RootState) => state.addProducts?.list[0] as DropdownOptions | null);
  const dropdowns = useSelector((state: RootState) => {
  const list = state.addProducts.list;

  return Array.isArray(list) ? list[0] : list;
});
  console.log("Dropdowns:", dropdowns);

  // const [loading, setLoading] = useState<boolean>(false);

  const getEmptyProduct = (): Product => ({
    productId: 0,
    sku: "",
    name: "",
    description: "",
    categoryId: 0,
    brandId: 0,
    listedOn: new Date().toISOString().slice(0, 10),
    listedBy: "Seller",
    fitId: 0,
    fabricId: 0,
    sleeveId: 0,
    reversible: false,
    neckTypeId: 0,
    fabricCareId: 0,
    productVariants: [
      {
        productVariantId: 0,
        productId: 0,
        colorId: 0,
        price: 0,
        salePrice: 0,
        discount: 0,
        inventory: 0,
        image: [""],
        productVariantSizes: []
      }
    ]
  });

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const addVariant = () => {
    setProduct((prev) => ({
      ...prev,
      productVariants: [
        ...prev.productVariants,
        {
          productVariantId: 0,
          productId: 0,
          sizeIds: [],
          colorId: 0,
          price: 0, // Changed from "" to 0
          salePrice: 0, // Changed from "" to 0
          discount: 0, // Changed from "" to 0
          inventory: 0, // Changed from "" to 0
          image: [""],
          productVariantSizes: []
        } as ProductVariant // Explicitly casting to ProductVariant
      ]
    }));

    setSelectedVariantIndex(product.productVariants.length);
  };

  const deleteVariant = (index: number) => {
    if (product.productVariants.length > 1) {
      setProduct((prev) => ({
        ...prev,
        productVariants: prev.productVariants.filter((_, i) => i !== index)
      }));
      setSelectedVariantIndex(index);
    }
  };

  const updateVariant = (index: number, updatedVariant: ProductVariant) => {
    const updatedVariants = [...product.productVariants];
    updatedVariants[index] = updatedVariant;
    setProduct((prev) => ({ ...prev, productVariants: updatedVariants }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = initialProduct ? "PUT" : "POST";
      const url = initialProduct
        ? `https://localhost:44314/api/Products/${product.productId}`
        : `https://localhost:44314/api/Products`;

      const response = await axios({
        method,
        url,
        data: product,
        headers: { "Content-Type": "application/json" }
      });

      if (response.data.error) {
        showToast("error", response.data.error);
      } else {
        setProduct(getEmptyProduct());
        showToast(
          "success",
          initialProduct
            ? "Product updated successfully!"
            : "Product added successfully!"
        );

        // Refresh the shared Redux product list before changing routes. Both the
        // product table and home page read this list, so they receive the latest
        // server data without requiring a browser refresh.
        await dispatch(fetchProducts(undefined));
        navigate("/productList");
      }
    } catch (error) {
      console.error("Error during API submission: ", error);
      showToast("error", "An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchDropdowns(undefined));
  }, [dispatch]);

  return (
    <>
      {loader && (
        <div className="product-submission-loader" role="status" aria-live="polite">
          <Loader />
          <span>Saving product…</span>
        </div>
      )}
      <div className="add-form">
        {/* <ToastContainer position="bottom-center" /> */}
        <div className="add-product-containers mt-4">
          <h2>{initialProduct ? "Edit Product" : "Add Product"}</h2>
          <form onSubmit={handleSubmit} className="product-forms">
            <div className="row">
              <div className="col-6">
                <Input
                  label="SKU"
                  placeholder="Enter SKU"
                  name="sku"
                  value={product.sku}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Name"
                  placeholder="Enter Name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                />
                <FormGroup
                  label="Description"
                  placeholder="Enter Description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  type="textarea"
                  required
                />
                <FormGroup
                  label="Category"
                  placeholder="Select Category"
                  name="categoryId"
                  value={product.categoryId}
                  onChange={handleChange}
                  options={dropdowns?.categories || []}
                  optionId="categoryId"
                  optionName="name"
                  type="select"
                />
                <FormGroup
                  label="Brand"
                  name="brandId"
                  value={product.brandId}
                  onChange={handleChange}
                  options={dropdowns?.brands || []}
                  optionId="brandId"
                  optionName="name"
                  type="select"
                />
                <FormGroup
                  label="Fit"
                  name="fitId"
                  value={product.fitId}
                  onChange={handleChange}
                  options={dropdowns?.fits || []}
                  optionId="fitId"
                  optionName="fitName"
                  type="select"
                />
                <FormGroup
                  label="Fabric"
                  name="fabricId"
                  value={product.fabricId}
                  onChange={handleChange}
                  options={dropdowns?.fabrics || []}
                  optionId="fabricId"
                  optionName="fabricName"
                  type="select"
                />
                <FormGroup
                  label="Sleeve"
                  name="sleeveId"
                  value={product.sleeveId}
                  onChange={handleChange}
                  options={dropdowns?.sleeves || []}
                  optionId="sleeveId"
                  optionName="sleeveType"
                  type="select"
                />
                <FormGroup
                  label="Neck Type"
                  name="neckTypeId"
                  value={product.neckTypeId}
                  onChange={handleChange}
                  options={dropdowns?.neckTypes || []}
                  optionId="neckTypeId"
                  optionName="neckTypeName"
                  type="select"
                />
                <FormGroup
                  label="Fabric Care"
                  name="fabricCareId"
                  value={product.fabricCareId}
                  onChange={handleChange}
                  options={dropdowns?.fabricCares || []}
                  optionId="fabricCareId"
                  optionName="careInstructions"
                  type="select"
                />
                <Checkbox
                  label="Reversible"
                  name="reversible"
                  checked={product.reversible}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6">
                <ProductVariantsList
                  productVariants={product.productVariants}
                  selectedVariantIndex={selectedVariantIndex}
                  setSelectedVariantIndex={setSelectedVariantIndex}
                  addVariant={addVariant}
                  deleteVariant={deleteVariant}
                  updateVariant={updateVariant}
                />
              </div>
            </div>
            <div className="submitContainer">
              <Button
                label={loader ? "Saving…" : initialProduct ? "Update" : "Add"}
                disabled={loader}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
