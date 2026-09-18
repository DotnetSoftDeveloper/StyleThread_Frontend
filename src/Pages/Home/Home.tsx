import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../Shared/Loader";
import "./Home.css";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchDropdowns, fetchProducts } from "../../Store/EntitySlices";
import FilterBar from "../../Components/FiilterBar/FilterBar";
import { Product } from "../../Types/Interface/IProduct";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import ProductCard from "../../Components/ProductCard/ProductCard";
import { Category, DropdownOptions } from "../../Types/Interface/DropDown";

const normalizeSearchText = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

const productMatchesSearch = (
  product: Product,
  searchTerm: string,
  dropdownOptions?: DropdownOptions,
) => {
  const normalizedSearch = normalizeSearchText(searchTerm);

  if (!normalizedSearch) {
    return true;
  }

  const categoryName = dropdownOptions?.categories?.find(
    (category) => category.categoryId === product.categoryId,
  )?.name;
  const brandName = dropdownOptions?.brands?.find(
    (brand) => brand.brandId === product.brandId,
  )?.name;
  const fitName = dropdownOptions?.fits?.find(
    (fit) => fit.fitId === product.fitId,
  )?.fitName;
  const fabricName = dropdownOptions?.fabrics?.find(
    (fabric) => fabric.fabricId === product.fabricId,
  )?.fabricName;
  const sleeveType = dropdownOptions?.sleeves?.find(
    (sleeve) => sleeve.sleeveId === product.sleeveId,
  )?.sleeveType;
  const neckTypeName = dropdownOptions?.neckTypes?.find(
    (neckType) => neckType.neckTypeId === product.neckTypeId,
  )?.neckTypeName;
  const fabricCare = dropdownOptions?.fabricCares?.find(
    (care) => care.fabricCareId === product.fabricCareId,
  )?.careInstructions;

  const searchableValues = [
    product.name,
    product.sku,
    product.description,
    product.listedBy,
    categoryName,
    brandName,
    fitName,
    fabricName,
    sleeveType,
    neckTypeName,
    fabricCare,
    ...product.productVariants.flatMap((variant) => [
      variant.colorName,
      dropdownOptions?.color?.find((color) => color.colorId === variant.colorId)?.colorName,
      ...variant.productVariantSizes.map(
        (variantSize) =>
          variantSize.size?.sizeName ??
          dropdownOptions?.sizes?.find((size) => size.sizeId === variantSize.sizeId)?.sizeName,
      ),
    ]),
  ];

  return searchableValues.some((value) =>
    normalizeSearchText(value).includes(normalizedSearch),
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const productData = useSelector((state: RootState) => state?.products?.list) as Product[];
  const dropdownList = useSelector((state: RootState) => state.addProducts?.list);
  const dropdownOptions = (Array.isArray(dropdownList)
    ? dropdownList[0]
    : dropdownList) as DropdownOptions | undefined;
  const loading = useSelector((state: RootState) => state.products.loading);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const searchTerm = useMemo(
    () => new URLSearchParams(location.search).get("search")?.trim() ?? "",
    [location.search],
  );
  
  useEffect(() => {
    dispatch(fetchProducts(searchTerm ? { searchTerm } : undefined));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    if (!dropdownOptions) {
      dispatch(fetchDropdowns(undefined));
    }
  }, [dispatch, dropdownOptions]);

  const filteredProducts = useMemo(() => {
    const searchedProducts = searchTerm
      ? productData.filter((product) =>
          productMatchesSearch(product, searchTerm, dropdownOptions),
        )
      : productData;

    return selectedCategoryId === null
      ? searchedProducts
      : searchedProducts.filter((product) => product.categoryId === selectedCategoryId);
  }, [dropdownOptions, productData, searchTerm, selectedCategoryId]);

  const handleClearSearch = () => {
    navigate({ pathname: "/home" });
  };

  const handleCardClick = (product: Product) => {
    navigate(`/product/${product.productId}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      // setShowDetailModal(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleCategorySelect = (category: Category) => {
    if (category.label.toLowerCase() === "all") {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(category.value);
    }
  };

  return (
    <main className="home-page">
      <section className="home-filter-panel">
        <FilterBar onCategorySelect={handleCategorySelect} />
      </section>
      <section className="home-products-panel">
        {searchTerm && !loading && (
          <div className="search-results-summary" role="status">
            <span>
              {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"} for "{searchTerm}"
            </span>
            <button type="button" onClick={handleClearSearch}>
              Clear
            </button>
          </div>
        )}
        {loading ? (
          <div className="center-loader">
            <Loader />
          </div>
        ) : (
          <div className="rowDesign">
            {filteredProducts.length > 0 ? filteredProducts.map((product, index) => (
              <ProductCard
                key={product.productId ?? index}
                product={product}
                colorOptions={dropdownOptions?.color ?? []}
                onCardClick={handleCardClick}
              />
            )) : (
              <p className="search-empty-state">
                {searchTerm ? `No products found for "${searchTerm}".` : "No products are available right now."}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
