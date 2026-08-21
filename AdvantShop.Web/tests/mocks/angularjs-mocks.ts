import angular, { IAugmentedJQuery, ICompileService, IRootScopeService, IScope } from 'angular';
import IInjectorService = angular.auto.IInjectorService;

export interface TestRenderResult<TScope extends IScope = IScope> {
    element: IAugmentedJQuery;
    scope: TScope;
}

export interface TestApp {
    render<TScopeProps extends Record<string, unknown> = Record<string, unknown>>(
        template: string | HTMLElement,
        scopeProps?: TScopeProps,
    ): TestRenderResult<IScope & TScopeProps>;
    $injector: IInjectorService;
}

export function createTestApp(modules: string[]): TestApp {
    const $injector: IInjectorService = angular.injector(['ng', 'ngMock', ...modules], false);

    const $rootScope = $injector.get<IRootScopeService>('$rootScope');
    const $compile = $injector.get<ICompileService>('$compile');

    const render = <TScopeProps extends Record<string | number, unknown> = Record<string | number, unknown>>(
        template: string | Element | JQuery,
        scopeProps?: TScopeProps,
    ): TestRenderResult<IScope & TScopeProps> => {
        const scope = $rootScope.$new(true) as IScope & TScopeProps;

        if (scopeProps) {
            Object.assign(scope, scopeProps);
        }

        const element = $compile(template)(scope);
        scope.$digest();

        return { element, scope };
    };

    return {
        render,
        $injector,
    };
}
