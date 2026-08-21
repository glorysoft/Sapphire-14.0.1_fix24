export default function () {
    const service = this;
    let maskControlConfig = {};

    service.setMaskControlConfig = function (config) {
        maskControlConfig = { ...config};
    };

    service.getMaskControlConfig = function () {
        return maskControlConfig;
    };
}
