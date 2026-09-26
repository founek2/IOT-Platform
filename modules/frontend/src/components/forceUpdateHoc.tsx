import React, { useState, useEffect, useCallback } from 'react';
import getLastUpdateText from '../utils/getLastUpdateText.js';

/**
 * Force update here, because need update circle text/color and disable button when afk
 * Add Box as warpper and forcing update by prop ackTime
 * @param {*} param0
 */
export default function ({ updateTime, children }: { updateTime: Date; children: JSX.Element }) {
    const [val, updateState] = useState(0);
    const forceUpdate = useCallback(() => updateState(1 + val), [val]); // ++val is causing after some time "read only exception"
    const [_, timeOut] = getLastUpdateText(updateTime);

    useEffect(() => {
        // console.log("timeout", timeOut, "s")
        if (!timeOut) return;

        let timeout = setTimeout(forceUpdate, timeOut * 1000);
        return () => clearTimeout(timeout);
    }, [val]);

    return children;
}
