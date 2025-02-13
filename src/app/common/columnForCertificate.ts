/*
 * Copyright (c) 2025 Maritime Connectivity Platform Consortium
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

import { convertTime } from './timeConverter';

/**
 * a json format for active certificates articulating how the corresponding interface should work
 */
export const ActiveCertificatesColumn = {
  serialNumber: {
    title: 'Serial number',
    type: 'string',
  },
    start: {
      title: 'Valid from',
      type: 'string',
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
    },
    end: {
      title: 'Valid until',
      type: 'string',
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
    },
};

/**
 * a json format for revoked certificates articulating how the corresponding interface should work
 */
export const RevokedCertificatesColumn = {
  serialNumber: {
    title: 'Serial number',
    type: 'string',
  },
  revokedAt: {
    title: 'Revoked from',
    type: 'string',
    valuePrepareFunction: (timestamp: any) => {
      return convertTime(timestamp);
    },
  },
  revokeReason: {
    title: 'Reason',
    type: 'string',
  },
};