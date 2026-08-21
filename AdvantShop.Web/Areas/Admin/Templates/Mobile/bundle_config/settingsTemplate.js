import '../Content/styles/_shared/chips/chips.scss';
import './design.js';
import '../../../Content/src/csseditor/csseditor.js';
import appDependency from '../../../../../scripts/appDependency.js';
import '../../../Content/src/settingsTemplate/settingsTemplate.js';
appDependency.addItem('settingsTemplate');

import '../Content/styles/views/settings.scss';

import '../../../Content/styles/design_style.css';

import '../../../../../scripts/_partials/zone/zone.js';
import zoneModule from '../../../../../scripts/_partials/zone/zone.module.ts';
appDependency.addItem(zoneModule);

import '../../../../../scripts/_common/modal/modal.module';
appDependency.addItem('modal');

import cmStat from '../../../Content/src/_shared/cm-stat/cmStat.module.js';
appDependency.addItem(cmStat);

import uiAceTextarea from '../../../Content/src/_shared/ui-ace-textarea/uiAceTextarea.module.js';
appDependency.addItem(uiAceTextarea);


import '../../../Content/src/_shared/icon-move/iconMove.js';
import '../../../Content/src/_shared/icon-move/styles/icon-move.css';
appDependency.addItem('iconMove');

import '../Content/vendors/ng-sortable-custom/ng-sortable.module.js';
import authSortingModule from '../../../Content/src/_partials/auth-sorting/authSorting.module.ts';
appDependency.addItem(authSortingModule);

import '../../../Content/src/settingsTemplate/modal/onePageCatalogConflictSettings/OnePageCatalogConflictSettings.js';

