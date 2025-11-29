/* Project https://github.com/AlexxIT/go2rtc */
import { VideoRTC } from './video-rtc.js';
const micIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>`;
const micOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 0 24 24" width="40"><path d="M0 0h24v24H0zm0 0h24v24H0z" fill="none"/><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>`

/**
 * This is example, how you can extend VideoRTC player for your app.
 * Also you can check this example: https://github.com/AlexxIT/WebRTC
 */
export class VideoStream extends VideoRTC {
    internalMic = false;

    set divMode(value) {
        this.querySelector('.mode').innerText = value;
        this.querySelector('.status').innerText = '';
    }

    set mic(value) {
        this.internalMic = value;
        const button = this.querySelector('.mic button');
        if (!button) return;

        if (value) {
            button.innerHTML = micIcon;
            this.unmuteMicrophone()
        }
        else {
            button.innerHTML = micOffIcon;
            this.muteMicrophone()
        }
    }

    set divError(value) {
        const state = this.querySelector('.mode').innerText;
        if (state !== 'loading') return;
        this.querySelector('.mode').innerText = 'error';
        this.querySelector('.status').innerText = value;
    }

    /**
     * Custom GUI
     */
    oninit() {
        console.debug('stream.oninit');
        super.oninit();

        this.innerHTML = `
        <style>
        .info {
            position: absolute;
            top: 15px;
            left: 0;
            padding: 12px;
            color: white;
            display: flex;
            pointer-events: none;
        }
        .mic {
            position: absolute;
            top: 5px;
            right: 0;
            padding: 12px;
            display: flex;
        }
        .mic button {
            background: none;
            border: none;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            pointer-events: all;
        }
        .mic button:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        .mic svg {
            fill: #fff;
        }
        </style>
        <div class="info">
            <div class="mode"></div>
            <div class="status"></div>
        </div>
        ${this.isMicrophoneEnabled() ? `<div class="mic"><button>${micOffIcon}</button></div>` : ''}
        `;

        const info = this.querySelector('.info');
        this.insertBefore(this.video, info);

        if (this.isMicrophoneEnabled())
            this.querySelector('.mic button').addEventListener('click', e => {
                console.log("hey hou")
                this.mic = !this.internalMic;
            })
    }

    onconnect() {
        console.debug('stream.onconnect');
        const result = super.onconnect();
        if (result) this.divMode = 'loading';
        this.mic = false;
        return result;
    }

    ondisconnect() {
        console.debug('stream.ondisconnect');
        super.ondisconnect();
    }

    onopen() {
        console.debug('stream.onopen');
        const result = super.onopen();

        this.onmessage['stream'] = msg => {
            console.debug('stream.onmessge', msg);
            switch (msg.type) {
                case 'error':
                    this.divError = msg.value;
                    break;
                case 'mse':
                case 'hls':
                case 'mp4':
                case 'mjpeg':
                    this.divMode = msg.type.toUpperCase();
                    break;
            }
        };

        return result;
    }

    onclose() {
        console.debug('stream.onclose');
        return super.onclose();
    }

    onpcvideo(ev) {
        console.debug('stream.onpcvideo');
        super.onpcvideo(ev);

        if (this.pcState !== WebSocket.CLOSED) {
            this.divMode = 'RTC';
        }
    }
}

// customElements.define('video-stream', VideoStream);