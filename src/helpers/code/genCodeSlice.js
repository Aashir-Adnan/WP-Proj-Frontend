import { createSlice } from "@reduxjs/toolkit";

const generatedPageSlice = createSlice({
  name: "generatedPage",
  initialState: {
    code: null, 
    title: "",
  },
  reducers: {
    setCode: (state, action) => {
      state.code = action.payload.code;
      state.title = action.payload.title || "";
    },
    clearCode: state => {
      state.code = "";
      state.title = "";
    },
  },
});

export const { setCode, clearCode } = generatedPageSlice.actions;
export default generatedPageSlice.reducer;
