import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PluginsState {
    stream: PluginState
    virtualDevice: VirtualDeviceState
}
export interface PluginState {
    enabled: boolean;
}
export interface VirtualDeviceState {
    enabled: boolean;
    name: string;
}

export const defaultVirtualDevice: VirtualDeviceState = {
    enabled: false,
    name: 'Tablet',
};

const initialState: PluginsState = {
    stream: {
        enabled: false
    },
    virtualDevice: defaultVirtualDevice,
};

export const pluginsSlice = createSlice({
    name: 'plugins',
    initialState,
    reducers: {
        updatePlugin: (state, action: PayloadAction<{ plugin: 'stream', state: Partial<PluginState> }>) => {
            state[action.payload.plugin] = { ...state[action.payload.plugin], ...action.payload.state }
        },
        updateVirtualDevice: (state, action: PayloadAction<Partial<VirtualDeviceState>>) => {
            // Persisted state from before this setting existed has no virtualDevice key
            state.virtualDevice = { ...defaultVirtualDevice, ...state.virtualDevice, ...action.payload };
        },
    },
});

export const pluginsReducerActions = pluginsSlice.actions;

export default pluginsSlice.reducer;
