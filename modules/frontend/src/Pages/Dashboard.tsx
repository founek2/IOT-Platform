import { Card, CardContent, CardHeader, CircularProgress, Grid } from "@mui/material"
import React from "react"
import DataList from "../components/DataList";
import PlotifyGauge from "../components/PlotifyGauge";
import { BrokerConnectionItem, BrokerData, ConnectionType, ItemExtended, useBrokerQuery } from "../endpoints/broker"
import { useDevicesAllQuery, useDevicesQuery } from "../endpoints/devices";


function extractHumanText(item: ItemExtended) {
    const user = item.user;
    const userSplitted = user.split("=");

    let text: string
    if (item.type == ConnectionType.guest)
        text = `Čeká na připojení ${userSplitted[1]}`
    else if (item.type == ConnectionType.device)
        text = `Zařízení ${userSplitted[1]}`
    else if (item.type == ConnectionType.user)
        text = `Uživatel ${user}`
    else
        text = `Neznámé spojení`

    if (item.connections.length > 1)
        return `${text} (${item.connections.length})`
    else return text
}



export default function Dashboard() {
    const { data, isLoading } = useBrokerQuery()
    const { data: devices, isLoading: isLoadingDevices } = useDevicesAllQuery()

    if (isLoading || isLoadingDevices) return <CircularProgress />;
    const dataConnections = data?.connections.items;
    const dataPaired = dataConnections?.filter(item => item.type == ConnectionType.device);

    return <Grid container justifyContent="center" spacing={2}>
        <Grid size={{ xs: 12, md: 7, lg: 6, xl: 3 }}>
            <Card sx={{ padding: 2 }}>
                <CardHeader title="Aktivní spojení" />
                <CardContent>
                    <DataList data={dataConnections || []} getHumanText={extractHumanText} />
                </CardContent>
            </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7, lg: 6, xl: 3 }}>
            <Card sx={{ padding: 2 }}>
                <CardHeader title="Aktivní spojení" />
                <CardContent>
                    <PlotifyGauge value={dataPaired?.length} maxValue={devices?.docs.length} />
                </CardContent>
            </Card>
        </Grid>
    </Grid>

}