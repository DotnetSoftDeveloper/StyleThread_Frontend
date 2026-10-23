import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { fetchDropdowns, fetchProducts } from "../../Store/EntitySlices";
import { ProductVariantsList } from "../../Components/ProductVariantList/ProductVariantsList";
import "./AddProduct.css";
import { Input } from "../../Components/Atoms/Input";
import { FormGroup } from "../../Components/Atoms/FormGroup";
import "react-toastify/dist/ReactToastify.css";
import {
  Product,
  ProductVariant
} from "../../Types/Interface/IProduct";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { getStoredToken } from "../../Utils/Helper/authHelpers";
import { resolveActiveTenantSlug } from "../../Utils/tenantHelper";
import Loader from "../../Components/Loader/Loader";
import {
  FaArrowLeft,
  FaBox,
  FaTags,
  FaSlidersH,
  FaCheck,
  FaSpinner
} from "react-icons/fa";

const AddProduct: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { product: initialProduct } = location.state || {};
  const productsFromStore = useSelector((state: RootState) => state.products?.list as Product[]) || [];
  const { showToast } = useToast();
  const [loader, setLoading] = useState<boolean>(false);

  const handleReturn = () => {
    if (location.pathname.startsWith("/admin")) {
      navigate("/admin/products");
    } else {
      navigate("/productList");
    }
  };

  const [product, setProduct] = useState<Product>({
    productId: initialProduct?.productId || 0,
    sku: initialProduct?.sku || "",
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    categoryId: initialProduct?.categoryId || 0,
    brandId: initialProduct?.brandId || 0,
    listedOn: initialProduct?.listedOn || new Date().toISOString().slice(0, 10),
    listedBy: initialProduct?.listedBy || "Seller",
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
  const dropdowns = useSelector((state: RootState) => {
    const list = state.addProducts.list;
    return Array.isArray(list) ? list[0] : list;
  });

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
          colorId: 0,
          price: 0,
          salePrice: 0,
          discount: 0,
          inventory: 0,
          image: [""],
          productVariantSizes: []
        } as ProductVariant
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
      const token = getStoredToken();
      const slug = resolveActiveTenantSlug();
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44314";

      const targetId = product.productId || (id ? Number(id) : 0);
      const isEditing = Boolean(initialProduct || targetId > 0);
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing && targetId > 0
        ? `${apiBaseUrl}/api/Products/${targetId}`
        : `${apiBaseUrl}/api/Products`;

      const sanitizedProduct = {
        ...product,
        productId: targetId > 0 ? targetId : product.productId,
        productVariants: product.productVariants.map((v) => ({
          ...v,
          price: Number(v.price) || 0,
          salePrice: Number(v.salePrice) || 0,
          inventory: Number(v.inventory) || 0,
          discount: Number(v.discount) || 0,
          colorId: Number(v.colorId) || 0,
          productId: targetId > 0 ? targetId : (v.productId || product.productId)
        }))
      };

      const response = await axios({
        method,
        url,
        data: sanitizedProduct,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(slug ? { "X-Tenant-Slug": slug } : {})
        }
      });

      if (response.data && response.data.error) {
        showToast("error", response.data.error);
      } else {
        setProduct(getEmptyProduct());
        showToast(
          "success",
          isEditing
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        await dispatch(fetchProducts(undefined));
        handleReturn();
      }
    } catch (error: any) {
      console.error("Error during API submission: ", error);
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An error occurred while submitting the form.";
      showToast("error", serverMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchDropdowns(undefined));
  }, [dispatch]);

  // Rehydrate product when directly navigating or refreshing /editProduct/:id
  useEffect(() => {
    if (!initialProduct && id) {
      if (Array.isArray(productsFromStore) && productsFromStore.length > 0) {
        const found = productsFromStore.find((p) => p.productId === Number(id));
        if (found) {
          setProduct({
            ...found,
              productVariants: found.productVariants?.length
                ? found.productVariants.map((variant: ProductVariant) => ({
                    productVariantId: variant.productVariantId || 0,
                    productId: variant.productId || 0,
                    colorId: variant.colorId || 0,
                    price: variant.price || 0,
                    salePrice: variant.salePrice || 0,
                    discount: variant.discount || 0,
                    inventory: variant.inventory || 0,
                    image: variant.image || [""],
                    productVariantSizes: variant.productVariantSizes || []
                  }))
                : getEmptyProduct().productVariants
          });
        }
      } else {
        dispatch(fetchProducts(undefined));
      }
    }
  }, [id, initialProduct, productsFromStore, dispatch]);

  return (
    <>
      {loader && (
        <div className="product-submission-loader" role="status" aria-live="polite">
          <Loader />
          <span>Saving product details…</span>
        </div>
      )}

      <div className="ap-container">
        {/* ── Page Header ── */}
        <div className="ap-header">
          <button
            type="button"
            className="ap-back-btn"
            onClick={handleReturn}
          >
            <FaArrowLeft /> Back to Products
          </button>
          <div className="ap-header-title-row">
            <div>
              <h2 className="ap-title">
                {initialProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="ap-subtitle">
                Enter product attributes, specifications, and configure style variants.
              </p>
            </div>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit}>
          <div className="ap-grid">
            {/* ── Left Column: Basic Info & Specifications ── */}
            <div className="ap-col">
              {/* Card 1: Basic Information */}
              <div className="ap-card">
                <h3 className="ap-card-title">
                  <FaBox className="ap-card-icon" /> Basic Information
                </h3>
                <div className="ap-form-row">
                  <Input
                    label="SKU"
                    placeholder="e.g. ST-TSHIRT-001"
                    name="sku"
                    value={product.sku}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Product Name"
                    placeholder="e.g. Classic Cotton Crew Tee"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <FormGroup
                  label="Description"
                  placeholder="Enter detailed description of the clothing product…"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  type="textarea"
                  required
                />
              </div>

              {/* Card 2: Categorization */}
              <div className="ap-card">
                <h3 className="ap-card-title">
                  <FaTags className="ap-card-icon" /> Category & Brand
                </h3>
                <div className="ap-form-row">
                  <FormGroup
                    label="Category"
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
                </div>
              </div>

              {/* Card 3: Clothing Specifications */}
              <div className="ap-card">
                <h3 className="ap-card-title">
                  <FaSlidersH className="ap-card-icon" /> Fabric & Fit Specifications
                </h3>
                <div className="ap-form-row">
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
                </div>

                <div className="ap-form-row">
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
                </div>

                <div className="ap-form-row">
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
                  <div className="inputContainer">
                    <label className="inputLabel">Reversible Feature</label>
                    <label className="ap-checkbox-wrapper">
                      <input
                        type="checkbox"
                        name="reversible"
                        checked={product.reversible}
                        onChange={handleChange}
                        className="ap-checkbox-input"
                      />
                      <span className="ap-checkbox-label">
                        This item is reversible
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Variants & Pricing ── */}
            <div className="ap-col">
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

          {/* ── Sticky Action Footer Bar ── */}
          <div className="ap-action-bar">
            <button
              type="button"
              className="ap-cancel-btn"
              onClick={handleReturn}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ap-submit-btn"
              disabled={loader}
            >
              {loader ? (
                <>
                  <FaSpinner className="spin" /> Saving…
                </>
              ) : (
                <>
                  <FaCheck /> {initialProduct ? "Update Product" : "Save Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProduct;
