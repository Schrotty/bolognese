var Settings = (function () {
    function Settings() {
    }
    Settings.exists = function () {
        return localStorage.length > 0;
    };
    Settings.store = function (key, value) {
        localStorage.setItem(key, value);
    };
    Settings.load = function (key) {
        return localStorage.getItem(key);
    };
    Settings.exist = function (key) {
        return Settings.load(key) != null;
    };
    Settings.storeIfNull = function (key, value) {
        if (!Settings.exist(key)) {
            Settings.store(key, value);
        }
    };
    return Settings;
}());
export { Settings };
//# sourceMappingURL=settings.js.map