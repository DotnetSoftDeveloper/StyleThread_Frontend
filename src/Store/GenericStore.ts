import { createSlice } from "@reduxjs/toolkit";
import { apiCallBegan } from "./Middleware/api";
import { AppDispatch } from "./ConfigureStore";

// Define entity state type
interface EntityState<T> {
  list: T | T[];
  loading: boolean;
}

// Generic function to create slices for different entities
const createEntitySlice = <T>(entityName: string) => {
  const slice = createSlice({
    name: entityName,
    initialState: {
      list: [] as T[],
      loading: false
    } as EntityState<T>,
    reducers: {
      entityRequested: (state) => {
        state.loading = true;
      },
      entityReceived: (state, action) => {
        state.list = action.payload;
        state.loading = false;
      },
      entityRequestFailed: (state) => {
        state.loading = false;
      }
    }
  });

  const { entityRequested, entityReceived, entityRequestFailed } =
    slice.actions;

  // Generic entity loader function
  const loadEntity = (url: string) => async (dispatch: AppDispatch) => {
    try {
      return dispatch(
        apiCallBegan({
          url,
          onStart: entityRequested.type,
          onSuccess: entityReceived.type,
          onError: entityRequestFailed.type
        })
      );
    } catch (error) {
      console.error("API error:", error);
    }
  };

  // ✅ Post data
  const postEntity =
    (url: string, data: unknown) => async (dispatch: AppDispatch) => {
      return dispatch(
        apiCallBegan({
          url,
          method: "POST",
          data,
          onStart: entityRequested.type,
          onSuccess: entityReceived.type, // or custom success
          onError: entityRequestFailed.type
        })
      );
    };

  // ✅ PUT
  const putEntity =
    (url: string, data: unknown) => async (dispatch: AppDispatch) => {
      return dispatch(
        apiCallBegan({
          url,
          method: "PUT",
          data,
          onStart: entityRequested.type,
          onSuccess: entityReceived.type,
          onError: entityRequestFailed.type
        })
      );
    };

  const deleteEntity = (url: string) => async (dispatch: AppDispatch) => {
    return dispatch(
      apiCallBegan({
        url,
        method: "DELETE",
        onStart: entityRequested.type,
        onSuccess: entityReceived.type,
        onError: entityRequestFailed.type
      })
    );
  };

  return {
    reducer: slice.reducer,
    actions: { loadEntity, postEntity, putEntity, deleteEntity }
  };
};

export default createEntitySlice;
