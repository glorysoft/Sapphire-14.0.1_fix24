export interface IApiMapService {
    setMapApiKey(apiKey: string): void;
    getMapApiKey(): ApiKeyType;
}

export type ApiKeyType = string;

export default class ApiMapService {
    private mapApiKey: ApiKeyType | null = null;

    setMapApiKey = (apiKey: ApiKeyType) => {
        this.mapApiKey = apiKey;
    };

    getMapApiKey = (): ApiKeyType | null => this.mapApiKey;
}
