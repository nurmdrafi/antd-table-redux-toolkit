import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const BASE_URL = "https://jsonplaceholder.typicode.com/posts";

// GET POST
export const getPosts = createAsyncThunk("posts/getPosts", async () => {
  try {
    const res = await axios.get(BASE_URL);
    return res.data;
  } catch (error) {
    console.error(error);
  }
});

// DELETE POST
export const deletePost = createAsyncThunk("posts/deletePost", async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (error) {
    return error.message;
  }
});

// UPDATE POST
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (updatedPost) => {
    console.log(updatedPost, "action");
    try {
      const res = await axios.put(`${BASE_URL}/${updatedPost.id}`, updatedPost);
      return res.data;
    } catch (error) {
      return error.message;
    }
  }
);
