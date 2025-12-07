import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userid: "34",
    email: "",
    username: "",
    saved_sites: [],
    token: "",
    photoURL: ""
  },
  reducers: {
    setUser: (state, action) => {
      console.log("ACTION PAYLOAD IN USER SETTER" , action.payload)
      state.userid = action.payload.userid || "";
      state.email = action.payload.email;
      state.username = action.payload.name;
      state.token = action.payload.token;
      state.photoURL = action.payload.photoURL;
      state.saved_sites = action.payload.saved_sites || [];
      console.log("SAVED SITES NOW: ", state.saved_sites)
    },
    clearUser: (state) => {
      state.email = "";
      state.username = "";
      state.saved_sites = [];
      state.token = "";
      state.photoURL = "";
      state.userid = "";
    },
    setSavedSites: (state, action) => {
      state.saved_sites = action.payload;
    },

  },
});

export const { setUser, clearUser, setSavedSites } = userSlice.actions;
export default userSlice.reducer;
