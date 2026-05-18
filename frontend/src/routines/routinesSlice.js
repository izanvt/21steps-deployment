import { createSlice } from "@reduxjs/toolkit";
import {
    fetchRoutines,
    fetchUserRoutines,
    createUserRoutine,
    updateUserRoutine,
    pauseUserRoutine,
    deleteUserRoutine,
    completeEvent,
    uncompleteEvent
} from "./thunks.js";

const initialState = {
    // rutinas predefinidas (plantillas)
    templates: [],
    templatesStatus: "idle", // idle | loading | succeeded | failed

    // rutinas del usuario
    userRoutines: [],
    userRoutinesStatus: "idle",

    // creación
    createStatus: "idle",
    createError: null,

    error: null,
};

const routinesSlice = createSlice({
    name: "routines",
    initialState,
    reducers: {
        resetCreateStatus(state) {
            state.createStatus = "idle";
            state.createError = null;
        },
    },
    extraReducers: (builder) => {

        // fetchRoutines
        builder
            .addCase(fetchRoutines.pending, (state) => {
                state.templatesStatus = "loading";
                state.error = null;

            })
            .addCase(fetchRoutines.fulfilled, (state, action) => {
                state.templatesStatus = "succeeded";
                state.templates = action.payload;
            })
            .addCase(fetchRoutines.rejected, (state, action) => {
                state.templatesStatus = "failed";
                state.error = action.payload;
            });

        // fetchUserRoutines
        builder
            .addCase(fetchUserRoutines.pending, (state) => {
                state.userRoutinesStatus = "loading";
                state.error = null;
            })
            .addCase(fetchUserRoutines.fulfilled, (state, action) => {
                state.userRoutinesStatus = "succeeded";
                state.userRoutines = action.payload;
            })
            .addCase(fetchUserRoutines.rejected, (state, action) => {
                state.userRoutinesStatus = "failed";
                state.error = action.payload;
            });

        // createUserRoutine
        builder
            .addCase(createUserRoutine.pending, (state) => {
                state.createStatus = "loading";
                state.error = null;
                state.createError = null;
            })
            .addCase(createUserRoutine.fulfilled, (state) => {
                state.createStatus = "succeeded";
            })
            .addCase(createUserRoutine.rejected, (state, action) => {
                state.createStatus = "failed";
                state.createError = action.payload;
            });

        // updateUserRoutine
        builder
            .addCase(updateUserRoutine.fulfilled, (state, action) => {
                const idx = state.userRoutines.findIndex(r => r.id === action.payload.id);
                if (idx !== -1) state.userRoutines[idx] = action.payload;
            });

        // pauseUserRoutine
        builder
            .addCase(pauseUserRoutine.fulfilled, (state, action) => {
                const idx = state.userRoutines.findIndex(r => r.id === action.meta.arg.id);
                if (idx !== -1) state.userRoutines[idx].paused = true;
            });

        // deleteUserRoutine
        builder
            .addCase(deleteUserRoutine.fulfilled, (state, action) => {
                state.userRoutines = state.userRoutines.filter(r => r.id !== action.meta.arg);
            });

        // completeEvent    
        builder
            .addCase(completeEvent.fulfilled, (state, action) => {
                const updatedEvent = action.payload;
                state.userRoutines = state.userRoutines.map(ur => ({
                    ...ur,
                    events: ur.events?.map(e =>
                        e.id === updatedEvent.id ? updatedEvent : e
                    ) ?? [],
                }));
            });

        // uncompleteEvent
        builder
            .addCase(uncompleteEvent.fulfilled, (state, action) => {
                const updatedEvent = action.payload;
                state.userRoutines = state.userRoutines.map(ur => ({
                    ...ur,
                    events: ur.events?.map(e =>
                        e.id === updatedEvent.id ? updatedEvent : e
                    ) ?? [],
                }));
            });
    },
});

export const { resetCreateStatus } = routinesSlice.actions;

// selectores
export const selectTemplates = (state) => state.routines.templates;
export const selectTemplatesStatus = (state) => state.routines.templatesStatus;
export const selectUserRoutines = (state) => state.routines.userRoutines;
export const selectUserRoutinesStatus = (state) => state.routines.userRoutinesStatus;
export const selectCreateStatus = (state) => state.routines.createStatus;
export const selectCreateError = (state) => state.routines.createError;

export default routinesSlice.reducer;