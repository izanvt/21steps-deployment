import { createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = "http://localhost:8000/api";

// headers de autenticación
const authHeaders = (getState) => {
  const token = getState().auth.token;

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// GET routines (predeterminadas)
export const fetchRoutines = createAsyncThunk(
  "routines/fetchRoutines",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/baseroutines`, {
        headers: authHeaders(thunkAPI.getState),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al cargar rutinas");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// GET rutinas del usuario
export const fetchUserRoutines = createAsyncThunk(
  "routines/fetchUserRoutines",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/routines`, {
        headers: authHeaders(thunkAPI.getState),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al cargar tus rutinas");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// GET rutina por ID
export const fetchUserRoutineById = createAsyncThunk(
  "routines/fetchUserRoutineById",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/routines/${id}`, {
        headers: authHeaders(thunkAPI.getState),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(
          result.message || "Error al cargar la rutina"
        );
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// CREATE rutina del usuario
export const createUserRoutine = createAsyncThunk(
  "routines/createUserRoutine",
  async (data, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/routines`, {
        method: "POST",
        headers: authHeaders(thunkAPI.getState),
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al crear la rutina");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// UPDATE rutina del usuario
export const updateUserRoutine = createAsyncThunk(
  "routines/updateUserRoutine",
  async ({ id, ...data }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/routines/${id}`, {
        method: "PATCH",
        headers: authHeaders(thunkAPI.getState),
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al actualizar la rutina");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// PAUSE rutina del usuario
export const pauseUserRoutine = createAsyncThunk(
  "routines/pauseUserRoutine",
  async ({ id, type }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/routines/${id}/pause`, {
        method: "POST",
        headers: authHeaders(thunkAPI.getState),
        body: JSON.stringify({ type }),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al pausar la rutina");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// UNPAUSE rutina del usuario
export const unpauseUserRoutine = createAsyncThunk(
  "routines/unpauseUserRoutine",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/routines/${id}/unpause`, {
        method: "POST",
        headers: authHeaders(thunkAPI.getState),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al despausar la rutina");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// DELETE rutina del usuario
export const deleteUserRoutine = createAsyncThunk(
  "routines/deleteUserRoutine",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/routines/${id}`, {
        method: "DELETE",
        headers: authHeaders(thunkAPI.getState),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al eliminar la rutina");
      }

      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// COMPLETE event
export const completeEvent = createAsyncThunk(
  "routines/completeEvent",
  async ({ id, metric_value, mood, notes }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/events/${id}/complete`, {
        method: "POST",
        headers: authHeaders(thunkAPI.getState),
        body: JSON.stringify({ metric_value, mood, notes }),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al completar evento");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);

// UNCOMPLETE event
export const uncompleteEvent = createAsyncThunk(
  "routines/uncompleteEvent",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/events/${id}/uncomplete`, {
        method: "POST",
        headers: authHeaders(thunkAPI.getState),
      });

      const result = await res.json();

      if (!res.ok) {
        return thunkAPI.rejectWithValue(result.message || "Error al marcar el evento com no completado");
      }

      return result;
    } catch (err) {
      return thunkAPI.rejectWithValue(err?.message);
    }
  }
);