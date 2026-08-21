(function (ng) {
    

    const helpTriggerService = function () {
        const service = this;
        let activeHelpTrigger;

        service.addActiveHelpTrigger = function (helpTrigger) {
            activeHelpTrigger = helpTrigger;
        };

        service.getActiveHelpTrigger = function () {
            return activeHelpTrigger;
        };

        service.clearActiveHelpTrigger = function (helpTrigger) {
            if (helpTrigger === activeHelpTrigger) {
                activeHelpTrigger = null;
            }
        };

        service.getContainerRect = function (container) {
            const rect = container.getBoundingClientRect();
            return {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                height: rect.height,
                width: rect.width,
                x: rect.x,
                y: rect.y,
            };
        };

        //https://www.geeksforgeeks.org/check-whether-a-given-point-lies-inside-a-triangle-or-not/
        service.checkInTriangle = function (triggerRect, containerRect, mouseLoc, options) {
            const point1 = { x: triggerRect.x - options.tolerance, y: triggerRect.y };
            const point2 = { x: containerRect.left + options.tolerance, y: containerRect.top - options.tolerance };
            const point3 = { x: containerRect.left + options.tolerance, y: containerRect.bottom + options.tolerance };
            return isTriangleInside(point1, point2, point3, mouseLoc);
        };

        function isTriangleInside(point1, point2, point3, currentPoint) {
            const a = triangleArea(point1, point2, point3);
            const a1 = triangleArea(currentPoint, point2, point3);
            const a2 = triangleArea(point1, currentPoint, point3);
            const a3 = triangleArea(point1, point2, currentPoint);
            return a === a1 + a2 + a3;
        }

        function triangleArea(point1, point2, point3) {
            return Math.abs((point1.x * (point2.y - point3.y) + point2.x * (point3.y - point1.y) + point3.x * (point1.y - point2.y)) / 2.0);
        }
    };

    ng.module('helpTrigger').service('helpTriggerService', helpTriggerService);
})(window.angular);
