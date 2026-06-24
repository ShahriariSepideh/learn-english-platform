import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "@/types/auth.types";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },

        clearAuthUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },

        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setAuthUser, clearAuthUser, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;