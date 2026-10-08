import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  Draft
} from "@reduxjs/toolkit";
import axios, { Method } from "axios";
import { GenericResponse } from "../Types/Interface/IGenericResponse";

export interface EntityState<T> {
  list: T | T[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

// 🔹 Generic async thunk factory
export const createEntityThunk = <T>(
  name: string,
  url: string,
  method: Method = "GET"
) =>
  createAsyncThunk<GenericResponse<T | T[]>, unknown | void>(
    `${name}/${method.toLowerCase()}`,
    async (payload, { rejectWithValue }) => {
      try {
        // ✅ standardize on 'auth', fallback to 'token' if needed
        const token =
          localStorage.getItem("auth") ?? localStorage.getItem("token") ?? "";

        const response = await axios.request<GenericResponse<T | T[]>>({
          baseURL: "https://localhost:44314",
          url,
          method,
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
          ...(method === "GET" || method === "DELETE"
            ? { params: payload } // send query params for GET/DELETE
            : { data: payload }) // send body for POST/PUT
        });

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          return rejectWithValue(err.response?.data ?? err.message);
        }
        return rejectWithValue("Unexpected error");
      }
    }
  );

// 🔹 Slice factory
export function createEntitySlice<T>(name: string) {
  const initialState: EntityState<T> = {
    list: [],
    loading: false,
    error: null,
    totalCount: 0
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setList: (state, action: PayloadAction<T[]>) => {
        state.list = action.payload as Draft<T[]>;
      },
      clearList: (state) => {
        state.list = [];
      }
    },
    extraReducers: (builder) => {
      builder
        // Pending
        .addMatcher(
          (action) =>
            action.type.startsWith(name) && action.type.endsWith("/pending"),
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )
        // Fulfilled
        .addMatcher(
          (action) =>
            action.type.startsWith(name) && action.type.endsWith("/fulfilled"),
          (state, action: PayloadAction<GenericResponse<T | T[]>>) => {
            state.loading = false;
            const payload = (action.payload as any) ?? {};
            const { success, content, totalCount, totalRecords, total } = payload;
            if (success && content) {
              if (Array.isArray(content)) {
                state.list = content as Draft<T[]>;
              } else if (
                content &&
                typeof content === "object" &&
                "items" in content &&
                Array.isArray((content as any).items)
              ) {
                state.list = (content as any).items as Draft<T[]>;
              } else {
                state.list = [content] as Draft<T[]>;
              }
            } else if (Array.isArray(payload)) {
              state.list = payload as Draft<T[]>;
            } else {
              state.list = [];
            }
            const count =
              totalCount ??
              totalRecords ??
              total ??
              (content && typeof content === "object"
                ? (content as any).totalCount ??
                  (content as any).totalRecords ??
                  (content as any).total
                : undefined);
            const listLen = Array.isArray(state.list) ? state.list.length : 0;
            state.totalCount = typeof count === "number" ? count : listLen;
          }
        )
        // Rejected
        .addMatcher(
          (action): action is PayloadAction<{ errorMessage?: string }> =>
            action.type.startsWith(name) && action.type.endsWith("/rejected"),
          (state, action) => {
            state.loading = false;
            state.error =
              (action.payload as { errorMessage?: string })?.errorMessage ||
              "Something went wrong";
          }
        );
    }
  });

  return slice;
}
