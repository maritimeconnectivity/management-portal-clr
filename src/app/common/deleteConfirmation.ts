/*
 * Copyright (c) 2026 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {TranslateService} from '@ngx-translate/core';
import {ItemType, itemTypeToString} from './menuType';
import {ConfirmModalComponent} from '../components/confirm-modal/confirm-modal.component';

// deleting these entities also revokes the certificates issued to them
const itemTypesWithCertificates: ItemType[] = [
    ItemType.User, ItemType.Device, ItemType.Vessel, ItemType.Service, ItemType.MMS, ItemType.Organization,
];

const describeItem = (item: any): string => {
    const name = item.name ?? item.roleName ?? [item.firstName, item.lastName].filter(Boolean).join(' ');
    const id = item.mrn ?? item.instanceId;
    const version = item.instanceVersion ?? item.version;
    const label = name && id && name !== id ? `${name} (${id})` : (name || id || '');
    return version ? `${label} - version ${version}` : label;
};

/**
 * Asks the user to confirm the deletion of the given items.
 * Resolves to true only if the user accepted the dialog.
 */
export const confirmDeletion = (modal: ConfirmModalComponent | undefined, translate: TranslateService,
                                itemType: ItemType, items: any[]): Promise<boolean> => {
    if (!modal) {
        return Promise.resolve(false);
    }
    const typeName = itemTypeToString(itemType).toLowerCase();
    return modal.open({
        title: items.length > 1 ? `Delete ${items.length} ${typeName}s` : `Delete ${typeName}`,
        message: translate.instant('warning.resource.beforeDeletion'),
        items: items.map(describeItem).filter(label => label),
        warning: itemTypesWithCertificates.includes(itemType)
            ? translate.instant(items.length > 1 ? 'warning.resource.beforeRevokeMultiple' : 'warning.resource.beforeRevoke').trim()
            : undefined,
        confirmText: 'Delete',
    });
};
