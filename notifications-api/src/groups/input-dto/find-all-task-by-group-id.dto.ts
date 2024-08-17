export class FindAllTasksByGroupQueryDTO {
    page: number;
    limit: number;
    sort: object;

    constructor(page: number, limit: number, sort: object) {
        this.page = page;
        this.limit = limit;
        this.sort = sort;
    }

    get skip() {
        return (this.page) * this.limit;
    }
}