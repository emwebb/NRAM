namespace Utils {
    export function getModel() : any {
        var model = document.getElementById('data-model')?.dataset.model;
        if(typeof(model) !="undefined") {
            return JSON.parse(model);
        } 
        
    }

    export function getClient() : Client {
        var client = document.getElementById('data-client')?.dataset.client;
        return JSON.parse(String(client));
    }

    export function ajax<T,B>(url : string, method : string, body : B | undefined) : Promise<T> {
        return new Promise((resolve, reject) => {
            $.ajax({
                method : method,
                url : url,
                data : body,
                success : (data) => {
                    resolve(data);
                },
                error : (err) => {
                    reject(err);
                }
            });
        });
    }

    let socket : SocketIOClient.Socket;
    let commHandler : EventTarget;

    export function getSocket() : SocketIOClient.Socket {
        return socket;
    }

    export function getCommHandler() : EventTarget {
        return commHandler;
    }

    export function initSocketIo() {
        socket = io(`${location.origin}`);
        commHandler = new EventTarget();
        socket.on('message', (message : CommMessage) => {
            commHandler.dispatchEvent(new CustomEvent(message.type, { detail : message}));
        });
    }

    export interface CommMessage {
        type : string;
    }

    export interface User {
        username : string;
        userId : string;
    }

    export interface Client {
        loggedIn : boolean;
        user : User | undefined;
    }
}

$(() => {
    $('.select2').select2({
        dropdownAutoWidth : true
    });
    $('.select2-200').select2({
        dropdownAutoWidth : true,
        width : '200'
    });
    Utils.initSocketIo();
});