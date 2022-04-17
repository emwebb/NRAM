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
    
    let socket = io("http://localhost:8080");
    socket.emit('Message', 'Hello World');
    socket.on('message', (message : any) => {
        console.log(message);
    });
});