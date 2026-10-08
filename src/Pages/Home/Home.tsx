import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../Shared/Loader";
import "./Home.css";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchDropdowns, fetchProducts } from "../../Store/EntitySlices";
import FilterBar from "../../Components/FiilterBar/FilterBar";
import { DEFAULT_CATEGORIES } from "../../Utils/constants";
import { Product } from "../../Types/Interface/IProduct";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import ProductCard from "../../Components/ProductCard/ProductCard";
import { Category, DropdownOptions } from "../../Types/Interface/DropDown";
import { LoginModal } from "../../Components/LoginModal/LoginModal";
import { useAuth } from "../Login/useAuth";
import HomeEmptyState from "../../Components/HomeEmptyState/HomeEmptyState";

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
  const { token } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const searchTerm = useMemo(
    () => new URLSearchParams(location.search).get("search")?.trim() ?? "",
    [location.search],
  );

  // Show login popup when user is logged out and visiting home for the first time
  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("hasSeenLoginModal");
    if (!token && !hasSeenModal) {
      const timer = setTimeout(() => {
        setIsLoginModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [token]);
  
  useEffect(() => {
    dispatch(fetchProducts(searchTerm ? { searchTerm } : undefined));
  }, [dispatch, searchTerm]);

  useEffect(() => {
    if (!dropdownOptions) {
      dispatch(fetchDropdowns(undefined));
    }
  }, [dispatch, dropdownOptions]);

  // Combine default categories with dynamic categories if provided by API
  const availableCategories = useMemo<Category[]>(() => {
    if (dropdownOptions?.categories && dropdownOptions.categories.length > 0) {
      const dynamicCategories: Category[] = dropdownOptions.categories.map((cat) => ({
        label: cat.name,
        value: cat.categoryId
      }));
      return [{ label: "All", value: 0 }, ...dynamicCategories];
    }
    return DEFAULT_CATEGORIES;
  }, [dropdownOptions]);

  // Get active category's friendly label
  const selectedCategoryName = useMemo(() => {
    if (selectedCategoryId === null || selectedCategoryId === 0) return "All";
    const found = availableCategories.find((c) => c.value === selectedCategoryId);
    return found ? found.label : "";
  }, [availableCategories, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    const searchedProducts = searchTerm
      ? productData.filter((product) =>
          productMatchesSearch(product, searchTerm, dropdownOptions),
        )
      : productData;

    return selectedCategoryId === null || selectedCategoryId === 0
      ? searchedProducts
      : searchedProducts.filter((product) => product.categoryId === selectedCategoryId);
  }, [dropdownOptions, productData, searchTerm, selectedCategoryId]);

  const handleClearSearch = useCallback(() => {
    navigate({ pathname: "/home" });
  }, [navigate]);

  const handleCardClick = (product: Product) => {
    navigate(`/product/${product.productId}`);
  };

  const handleCategorySelect = (category: Category) => {
    if (category.value === 0 || category.label.toLowerCase() === "all") {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(category.value);
    }
  };

  const handleResetAll = useCallback(() => {
    setSelectedCategoryId(null);
    if (searchTerm) {
      navigate({ pathname: "/home" });
    }
  }, [navigate, searchTerm]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchProducts(searchTerm ? { searchTerm } : undefined));
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [dispatch, searchTerm]);

  const handleCloseLoginModal = () => {
    sessionStorage.setItem("hasSeenLoginModal", "true");
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem("hasSeenLoginModal", "true");
    setIsLoginModalOpen(false);
  };

  return (
    <main className="home-page">
      {/* Category Navigation Panel */}
      <section className="home-filter-panel" aria-label="Collections and Categories">
        <FilterBar
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategoryId}
          categories={availableCategories}
        />
      </section>

      {/* Main Products Display Panel */}
      <section className="home-products-panel" aria-label="Product Listings">
        {/* Active Search Summary Bar */}
        {searchTerm && !loading && (
          <div className="search-results-summary" role="status">
            <div className="search-results-summary__info">
              <span className="search-results-summary__badge">Search Filter</span>
              <span className="search-results-summary__text">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found for "<strong>{searchTerm}</strong>"
                {selectedCategoryId && selectedCategoryName && (
                  <> in <em>{selectedCategoryName}</em></>
                )}
              </span>
            </div>
            <button
              type="button"
              className="search-results-summary__clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search filter"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="center-loader" aria-label="Loading products">
            <Loader />
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Populated Product Grid */
          <div className="rowDesign">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.productId ?? index}
                product={product}
                colorOptions={dropdownOptions?.color ?? []}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          /* Professional Animated Empty State */
          <HomeEmptyState
            searchTerm={searchTerm}
            selectedCategoryId={selectedCategoryId}
            selectedCategoryName={selectedCategoryName}
            categories={availableCategories}
            onSelectCategory={handleCategorySelect}
            onClearSearch={handleClearSearch}
            onResetAll={handleResetAll}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </section>

      {/* Login Popup for first-time / logged-out users */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </main>
  );
};

export default Home;
