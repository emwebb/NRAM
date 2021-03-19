export namespace Utils{
    export function shuffle<T>(inputArray : T[]) : T[] {
        let shuffledArray : T[] = Object.assign([], inputArray);
        let currentIndex = shuffledArray.length;
        let temporaryValue : T;
        let randomIndex : number;
        while(currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = shuffledArray[currentIndex];
            shuffledArray[currentIndex] = shuffledArray[randomIndex];
            shuffledArray[randomIndex] = temporaryValue;
        }

        return shuffledArray;
    }

    export function clone<T>(orig : T) : T {
        return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig);
    }
}