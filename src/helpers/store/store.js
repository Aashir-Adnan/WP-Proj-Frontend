import { configureStore } from "@reduxjs/toolkit";
import generatedPageReducer from "../code/genCodeSlice";
import user from "../user/userSlice";
export const store = configureStore({
  reducer: {
    generatedPage: generatedPageReducer,
    user: user,
  },
});
