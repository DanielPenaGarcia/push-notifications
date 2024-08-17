export interface GroupDTO {
    id: string;
    name: string;
    code: string;
}

export interface CreateGroupDTO {
    name: string;
    code: string;
}

export interface AddGroupDTO {
    groupCode: string;
}