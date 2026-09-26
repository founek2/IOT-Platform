import Box from '@mui/material/Box';
import React, { Suspense, lazy } from 'react';
import { useAppSelector } from '../hooks/index.js';
import { getColorMode } from '../selectors/getters.js';

const PlotlyChart = lazy(() => import(/* webpackChunkName: 'PlotifyChart' */ './PlotifyChart'));
// rgba(255, 255, 255, 0.7);
const layout = (mode: 'light' | 'dark') => ({
    // width: 600,
    plot_bgcolor: mode === 'dark' ? 'rgba(0,0,0,0)' : 'rgb(255, 255, 255)',
    paper_bgcolor: mode === 'dark' ? 'rgba(0,0,0,0)' : 'rgb(255, 255, 255)',
    colorway: ['#4E86EC', '#DC3912', '#FF9900', '#109618', '#990099', '#0099C6', '#DD4477'],
    autosize: true,
    height: 200,
    // title: 'A Fancy Plot',
    xaxis: {
        tickformat: '%H:%M',
        showgrid: false,
        nticks: 4,
        tickfont: {
            color: mode === 'dark' ? '#121212' : undefined,
        },

        // tickmode: 'auto',
    },
    yaxis: {
        gridcolor: mode === 'dark' ? '#121212' : undefined,
        nticks: 4,
        tickmode: 'auto',
        tickfont: {
            color: mode === 'dark' ? '#121212' : undefined,
        },
    },
    margin: {
        b: 30,
        t: 0,
        l: 40,
        r: 0,
        pad: 10,
    },
});

interface ChartSimpleProps {
    value: any;
    maxValue?: number
}

function PlotifyGauge({ value, maxValue }: ChartSimpleProps) {
    const mode = useAppSelector(getColorMode);

    return (
        <Box
            sx={(theme) => ({
                root: {
                    marginBottom: theme.spacing(2),
                    // marginLeft: "10%"

                    [theme.breakpoints.up('sm')]: {
                        width: '90%',
                        margin: '0 auto',
                    },
                    // height: 415,
                },
                loader: {
                    left: 10,
                },
                loading: {
                    display: 'flex',
                    justifyContent: 'center',
                },
                // timeline: { showRowLabels: false },
                // avoidOverlappingGridLines: false,
            })}
        >
            <Suspense fallback={<div>Loading...</div>}>
                <PlotlyChart data={[{
                    domain: { x: [0, 1], y: [0, 1] },
                    value: value,
                    title: { text: "Speed" },
                    type: "indicator",
                    mode: "gauge+number+delta",
                    gauge: {
                        axis: { range: [null, maxValue ? maxValue : null] },
                    },
                    ...(maxValue ? { delta: { reference: maxValue } } : {})
                }]} layout={layout(mode)} />
            </Suspense>
        </Box>
    );
}

export default PlotifyGauge;
