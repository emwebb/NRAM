namespace Utils {
    export function getModel() : any {
        var model = document.getElementById('data-model')?.dataset.model;
        if(typeof(model) !="undefined") {
            return JSON.parse(model);
        } 
        
    }
}