import socketio from 'socket.io'
export class CommHandler {

    io : socketio.Server;
    userMap : Map<string,socketio.Socket>;
    constructor(io : socketio.Server) {
        this.io = io;
        this.userMap = new Map<string, socketio.Socket>();
        io.on('connect', (socket) => {
            if((socket.request as any).user && (socket.request as any).user.logged_in) {
                this.userMap.set(((socket.request as any).user.id as string), socket);
                socket.on("disconnect", () => {
                    this.userMap.delete(((socket.request as any).user.id as string));
                });
            }
        });
    }

    isUserConnected(userId : string) {
        return this.userMap.has(userId);
    }

    sendMessage(userId : string, message : any) {
        if(this.userMap.has(userId)) {
            this.userMap.get(userId)!.send(message);
        }
    }
}