import { Box, Grid, Skeleton } from "@mui/material"
import React from "react"
import { GridLocations } from "../components/GridLocations"

export function LocationsLoader() {

    return <Grid container justifyContent="center">
        <Grid
            size={{ xs: 12, md: 10, lg: 8, xl: 7 }}
        >
            <Skeleton variant="rectangular" width={200} height={35} sx={{ margin: "0 auto", mb: 1, mt: 1 }} />
            <Grid>
                <GridLocations>
                    <Skeleton variant="rectangular" height={104} />
                    <Skeleton variant="rectangular" height={104} />
                    <Skeleton variant="rectangular" height={104} />
                    <Skeleton variant="rectangular" height={104} />
                </GridLocations>
            </Grid>
        </Grid>
    </Grid>
}