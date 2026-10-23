import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { WishlistItem } from "../Types/Interface/IWishlist";
import {
  fetchWishlistApi,
  fetchWishlistProductIdsApi,
  addToWishlistApi,
  removeFromWishlistApi,
} from "../Services/wishlistService";

interface WishlistState {
  items: WishlistItem[];
  itemIds: number[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  itemIds: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWishlistApi();
      if (response.success && response.content) {
        return response.content;
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load wishlist");
    }
  }
);

export const fetchWishlistIds = createAsyncThunk(
  "wishlist/fetchWishlistIds",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWishlistProductIdsApi();
      if (response.success && response.content) {
        return response.content;
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load wishlist IDs");
    }
  }
);

export const toggleWishlistAction = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (
    { productId, item }: { productId: number; item?: WishlistItem },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { wishlist: WishlistState };
    const isCurrentlyWishlisted = state.wishlist.itemIds.includes(productId);

    try {
      if (isCurrentlyWishlisted) {
        await removeFromWishlistApi(productId);
        return { productId, isWishlisted: false };
      } else {
        await addToWishlistApi(productId);
        return { productId, isWishlisted: true, item };
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Wishlist action failed");
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeItem",
  async (productId: number, { rejectWithValue }) => {
    try {
      await removeFromWishlistApi(productId);
      return productId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove item");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.itemIds = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.itemIds = action.payload.map((item) => item.productId);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchWishlistIds
      .addCase(fetchWishlistIds.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.itemIds = action.payload;
      })
      // toggleWishlistAction
      .addCase(toggleWishlistAction.fulfilled, (state, action) => {
        const { productId, isWishlisted, item } = action.payload;
        if (isWishlisted) {
          if (!state.itemIds.includes(productId)) {
            state.itemIds.push(productId);
          }
          if (item && !state.items.some((i) => i.productId === productId)) {
            state.items.unshift(item);
          }
        } else {
          state.itemIds = state.itemIds.filter((id) => id !== productId);
          state.items = state.items.filter((i) => i.productId !== productId);
        }
      })
      // removeWishlistItem
      .addCase(removeWishlistItem.fulfilled, (state, action: PayloadAction<number>) => {
        state.itemIds = state.itemIds.filter((id) => id !== action.payload);
        state.items = state.items.filter((i) => i.productId !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
