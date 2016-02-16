export enum Method {'GET', 'POST', 'PUT', 'DELETE'};

export interface Http {
    url: string;
    method: Method;
    data?: any;
}

export interface Action {
    http?: Http;
}