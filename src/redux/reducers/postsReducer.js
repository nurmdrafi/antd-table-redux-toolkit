import { createSlice } from "@reduxjs/toolkit";
import { deletePost, getPosts, updatePost } from "../actions/postActions";

const initialState = {
  posts: [],
  isSuccess: false,
  error: null,
  loading: false,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  extraReducers: (builder) => {
    // GET POST
    builder.addCase(getPosts.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getPosts.fulfilled, (state, action) => {
      state.loading = false;
      state.posts.push(...action.payload);
      state.isSuccess = true;
    });
    builder.addCase(getPosts.rejected, (state, action) => {
      state.loading = false;
      state.isSuccess = false;
      state.error = action.payload;
    });
    // DELETE POST
    builder.addCase(deletePost.fulfilled, (state, action) => {
      // state.loading = false;
      state.posts = state.posts.filter((post) => post.id !== action.payload);
      state.isSuccess = true;
    });
    builder.addCase(deletePost.rejected, (state, action) => {
      state.isSuccess = false;
      state.error = action.payload;
    });
    // UPDATE POST
    builder.addCase(updatePost.fulfilled, (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id
      );
      state[index] = {
        ...state[index],
        ...action.payload,
      };
      state.isSuccess = true;
    });
    builder.addCase(updatePost.rejected, (state, action) => {
      state.isSuccess = false;
      state.error = action.payload;
    });
  },
});

export default postsSlice.reducer;
