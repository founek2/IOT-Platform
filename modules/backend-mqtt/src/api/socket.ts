import { logger } from 'common/logger';
import { JwtService } from 'common/services/jwtService';
import { Server as serverIO, Socket } from 'socket.io';

type socketWithUser = {
    request: { user?: { id: string } };
} & Socket;

/**
 * Handle for SocketIO
 */
export default (io: serverIO, jwtService: JwtService) => {
    /* Login middleware to authenticate using JWT token */
    io.use(async (socket: socketWithUser, next) => {
        let token = socket.handshake.query.token as string;
        const payload = await jwtService.verify(token);

        payload
            .ifRight(p => {
                socket.request.user = { id: p.sub }
                next()
            })
            .ifLeft(() => next())
    });

    io.on('connection', (socket: socketWithUser) => {
        logger.debug('New client connected', socket.request.user?.id || 'unknown');
        if (socket.request.user) {
            // if authenticated, then join the appropriate group
            socket.join(socket.request.user.id);
        }

        // default public group
        socket.join('public');

        socket.on('disconnect', () => {
            logger.debug('Client disconnected');
        });
    });
};
