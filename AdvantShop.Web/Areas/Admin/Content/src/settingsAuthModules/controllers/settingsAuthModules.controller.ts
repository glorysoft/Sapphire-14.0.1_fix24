import { IToasterService } from 'ngtoaster';
import { ISettingsAuthModulesService } from '../services/settingsAuthModules.service';
import ISettings from '../types/ISettings';
import { isResponseError, type Response } from '../../../../../../scripts/@types/http';
import { translate } from 'angular';

export interface ISettingsAuthModulesController {
    toaster: IToasterService;
    settingsAuthModulesService: ISettingsAuthModulesService;
    uiGridCustomConfig: any;
    $translate: translate.ITranslateService;

    settings?: ISettings;
    grid?: any;
    gridAuthModulesOptions: void;

    $onInit(): void;
    getSettings(): void;
    setUseAuthModule(useAuthModules: boolean): void;
    gridAuthModulesOnInit(grid: any): void;
    gridUpdate(): void;
}

export default class SettingsAuthModulesController implements ISettingsAuthModulesController {
    settings?: ISettings;
    grid?: any;
    gridAuthModulesOptions: any;

    /* @ngInject */
    constructor(
        readonly toaster: IToasterService,
        readonly settingsAuthModulesService: ISettingsAuthModulesService,
        readonly uiGridCustomConfig: any,
        readonly $translate: translate.ITranslateService,
    ) {
        this.gridAuthModulesOptions = angular.extend({}, uiGridCustomConfig, {
            columnDefs: [
                {
                    name: 'Name',
                    displayName: this.$translate.instant('Admin.Js.SettingsAuthModules.GridAuthModules.Name'),
                    enableSorting: false,
                    enableCellEdit: false,
                },
                {
                    name: 'Default',
                    displayName: this.$translate.instant('Admin.Js.SettingsAuthModules.GridAuthModules.Default'),
                    enableSorting: false,
                    enableCellEdit: false,
                    width: 150,
                    cellTemplate: `<ui-grid-custom-switch data-row="row"
                                                          data-field-name="Default">
                        </ui-grid-custom-switch>`,
                },
                {
                    name: 'Enabled',
                    displayName: this.$translate.instant('Admin.Js.SettingsAuthModules.GridAuthModules.Enabled'),
                    enableSorting: false,
                    enableCellEdit: false,
                    width: 150,
                    cellTemplate: `<ui-grid-custom-switch data-row="row"
                                                          data-readonly="row.entity.Default && row.entity.Enabled"
                                                          data-field-name="Enabled">
                        </ui-grid-custom-switch>`,
                },
            ],
            uiGridCustom: {
                selectionOptions: [],
            },
        });
    }

    $onInit = (): void => {
        this.getSettings();
    };

    getSettings = (): void => {
        this.settingsAuthModulesService
            .getSettings()
            .then((settings: ISettings) => {
                this.settings = settings;
            })
            .catch((error: Error) => {
                this.toaster.pop('error', '', error.message);
            });
    };

    setUseAuthModule = (useAuthModules: boolean): void => {
        this.settingsAuthModulesService
            .setUseAuthModule(useAuthModules)
            .then((response: Response) => {
                if (!isResponseError(response)) {
                    this.toaster.pop('success', '', this.$translate.instant('Admin.Js.SettingsAuthModules.SetUseAuthModuleSuccess'));
                } else {
                    response.errors.forEach((error: string) => {
                        this.toaster.pop('error', '', error);
                    });
                    this.getSettings();
                }
            })
            .catch((error: Error) => {
                this.toaster.pop('error', '', error.message);
                this.getSettings();
            });
    };

    gridAuthModulesOnInit = (grid: any): void => {
        this.grid = grid;
    };

    gridUpdate = (): void => {
        this.grid.fetchData();
    };
}
