import { Paper } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { VideoStream } from './videoStream/video-stream.js';

if (!customElements.get('video-stream')) customElements.define('video-stream', VideoStream);

interface VideoStreamProps {
    src: string;
}
export function WebRtcStream({ src }: VideoStreamProps) {
    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const viewers: VideoStream[] = [];
        const url = new URL(src);
        const params = url.searchParams;

        // support multiple streams and multiple modes
        const streams = params.getAll('src');
        const modes = params.getAll('mode');
        const media = params.getAll('media');
        if (modes.length === 0) modes.push('');

        while (modes.length > streams.length) {
            streams.push(streams[0]);
        }
        while (streams.length > modes.length) {
            modes.push(modes[0]);
        }

        if (streams.length > 1) {
            document.body.className = 'flex';
        }

        const background = params.get('background') === 'true';
        const width = '1 0 ' + (params.get('width') || '320px');

        for (let i = 0; i < streams.length; i++) {
            const video = document.createElement('video-stream') as unknown as VideoStream;
            video.background = background;
            video.mode = modes[i] || video.mode;
            video.style.flex = width;
            video.media = media.length > 0 ? media[0].replaceAll(' ', ',') : video.media;
            console.log('calculated', video.media);

            video.src = new URL(`/live/webrtc/api/ws?src=${encodeURIComponent(streams[i])}`, url.href);
            container.appendChild(video);
            viewers.push(video);
        }

        return () => {
            viewers.forEach((video) => video.remove());
        };
    }, [src]);

    return <Paper sx={{ position: 'relative' }} ref={(v) => (ref.current = v || undefined)} />;
}
