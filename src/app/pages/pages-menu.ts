/*
 * Copyright (c) 2024 Maritime Connectivity Platform Consortium
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


/**
 * menu for pages
 */
export const MENU_ITEMS: any[] = [
  {
    title: 'menu.ir',
    icon: 'lock-outline',
    children: [
      {
        title: 'menu.ir.organizations',
        link: '/pages/ir/organizations',
      },
      {
        title: 'menu.ir.guide',
        link: '/pages/ir/guide',
      },
    ],
  },
  {
    title: 'menu.sr',
    icon: 'layers-outline',
    children: [
      {
        title: 'menu.sr.instances',
        link: '/pages/sr/instances',
      },
      {
        title: 'menu.sr.search',
        link: '/pages/sr/search',
      },
      {
        title: 'menu.sr.guide',
        link: '/pages/sr/guide',
      },
    ],
  },
  {
    title: 'menu.ledger',
    icon: 'radio-outline',
    children: [
      {
        title: 'menu.ledger.search',
        link: '/pages/ledger/search',
      },
      {
        title: 'menu.ledger.guide',
        link: '/pages/ledger/guide',
      },
    ],
  },
  {
    title: 'menu.about',
    icon: 'bulb-outline',
    link: '/pages/about',
  },
];

export const MIR_MENU_FOR_ADMIN = {
  title: 'menu.ir.admin',
  link: '/pages/ir/orgcandidates',
};

export const MIR_MENU_FOR_ORG = {
  title: 'menu.ir.org',
  home: true,
  children: [
    {
      title: 'menu.ir.org.devices',
      link: '/pages/ir/devices',
    },
    {
      title: 'menu.ir.org.services',
      link: '/pages/ir/services',
    },
    {
      title: 'menu.ir.org.users',
      link: '/pages/ir/users',
    },
    {
      title: 'menu.ir.org.vessels',
      link: '/pages/ir/vessels',
    },
    {
      title: 'menu.ir.org.roles',
      link: '/pages/ir/roles',
    },
  ],
};

export const MSR_MENU_FOR_ORG = {
  title: 'menu.sr.org',
  children: [
    {
      title: 'menu.sr.org.services',
      link: '/pages/sr/instanceorg',
    },
  ],
};
