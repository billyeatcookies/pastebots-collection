import * as fs from 'fs';

export default class File{
    path: string
    constructor(path: string){
        this.path = path;
    }
    read(): object | Array<any>{
        return JSON.parse(fs.readFileSync(this.path).toString());
    }
    write(data: object | Array<any>){
        fs.writeFileSync(this.path, JSON.stringify(data, null, 4));
    }
}