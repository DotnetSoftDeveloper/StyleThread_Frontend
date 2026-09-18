import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./ConfigureStore";

// ✅ Typed version of useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// ✅ Typed version of useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
