import { Grid, Skeleton, Typography } from "@mui/material"
import React from "react"

const items = [0, 1, 2, 3, 4, 5, 6]
export function SecurityLoader() {
    return <Grid container spacing={1} width="100%" maxWidth={600}>
        {items.map((i) =>
            <Grid size={{ xs: 12 }} key={i}>
                <Skeleton variant="rectangular" height={76} />
            </Grid>
        )}
    </Grid>
}