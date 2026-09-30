import React from 'react';
import PlotifyChartModule, { IPlotlyChartProps } from 'react-plotlyjs-ts';

// CJS package: Vite interop may return the module object ({ default }) instead of the component
const PlotifyChartTs: typeof PlotifyChartModule =
    (PlotifyChartModule as unknown as { default?: typeof PlotifyChartModule }).default ?? PlotifyChartModule;

function PlotifyChart(props: IPlotlyChartProps) {
    return <PlotifyChartTs {...props} />;
}

export default PlotifyChart;
