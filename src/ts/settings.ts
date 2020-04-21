export class Settings {
    static exists(): boolean {
        return localStorage.length > 0;
    }

    static store(key: string, value: any) {
        localStorage.setItem(key, value);
    }

    static load(key: string): any {
        return localStorage.getItem(key);
    }

    static loadBoolean(key: string): boolean {
        return JSON.parse(Settings.load(key));
    }

    static exist(key: string): boolean {
        return Settings.load(key) != null;
    }

    static storeIfNull(key: string, value: any) {
        if (!Settings.exist(key)) {
            Settings.store(key, value);
        }
    }
}

