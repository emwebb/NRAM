import { Models } from "../mongoose/Schemas";

export default class {
    models: Models
    constructor(models: Models) {
        this.models = models
    }
}