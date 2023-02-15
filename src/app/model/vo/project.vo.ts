export class AuthorVO {
    public id: number;
    public name: string;
    public surname: string;
}

export class BookVO {
    public id: number;
    public name: string;
    public author: AuthorVO;
    public categories: CategoryVO;
}

export class CategoryVO {
    public id: number;
    public name: string;
}

export class GroupVO {
    public id: number;
    public userId: number;
    public name: string;
    public isPublic: boolean;
}

export class QuoteVO {
    public id: number;
    public text: string;
    public isPublic: boolean;
    public canBeAddedToGroup: boolean;
    public rating: number;
    public book: BookVO;
    public user: UserVO;
    public groups: GroupVO[];
    public tags: TagVO[];
}

export class RoleVO {
    public id: number;
    public name: string;
}

export class TagVO {
    public id: number;
    public name: string;
}

export class UserVO {
    public id: number;
    public name: string;
    public surname: string;
    public email: string;
    public username: string;
    public password: string;
    public roles: RoleVO[];
}
