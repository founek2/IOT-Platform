import React, { useEffect, useRef, useState } from "react"
import ErrorMessages from "common/src/localization/error";
import { SnackbarKey, useSnackbar } from "notistack";
import { Socket } from "socket.io-client"
import { useAppSelector } from "../hooks";
import { isLoggedIn } from "../selectors/getters";

interface NetworkStatusProps {
    socket?: Socket
}
export default function NetworkStatus({ socket }: NetworkStatusProps) {
    const loggedIn = useAppSelector(isLoggedIn)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const ref = useRef<SnackbarKey>();

    useEffect(() => {
        if (!loggedIn) return;

        let timeout: NodeJS.Timeout | undefined;

        function handleConnect() {
            if (timeout) {
                clearTimeout(timeout)
                timeout = undefined
            }
            if (!ref.current) return

            closeSnackbar(ref.current)
            ref.current = undefined
        }

        function handleDisconnect() {
            if (timeout) clearTimeout(timeout)

            timeout = setTimeout(() => {
                if (ref.current) return;
                
                const snackbarKey = enqueueSnackbar(ErrorMessages.getMessage("unstableConnection"), { persist: true })
                ref.current = snackbarKey
            }, 800)
        }

        if (!socket?.connected && !ref.current) {
            handleDisconnect()
        }

        if (socket?.connected && ref.current) {
            handleConnect()
        }

        socket?.on("connect", handleConnect)
        socket?.on("disconnect", handleDisconnect)

        return () => {
            if (timeout) clearTimeout(timeout)
            socket?.removeListener("connect", handleConnect)
            socket?.removeListener("disconnect", handleDisconnect)
        }
    }, [socket, loggedIn])

    return null
}