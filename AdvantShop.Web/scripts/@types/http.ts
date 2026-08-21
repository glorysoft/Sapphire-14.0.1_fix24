export interface IResponseData<TData = null> {
    result: boolean;
    obj?: TData;
    message?: string;
}

export interface ResponseError<TError = string[]> {
    errors: TError;
}

export type Response<TSuccess = null, TError = string[]> = IResponseData<TSuccess> | ResponseError<TError>;

export function isResponseError<TSuccess = null, TError = string[]>(
    res: IResponseData<TSuccess> | ResponseError<TError>,
): res is ResponseError<TError> {
    return (res as ResponseError<TError>).errors !== undefined;
}
