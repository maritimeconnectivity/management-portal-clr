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
interface MenuItem {
  title: string;
  icon?: string;
  link?: string;
  group?: string;
  forSiteAdmin?: boolean;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    title: 'menu.ir',
    icon: 'lock',
    children: [
      {
        title: 'menu.ir.myorg',
      },
      {
        title: 'menu.ir.org.devices',
        link: '/pages/ir/device',
        group: 'myorg',
      },
      {
        title: 'menu.ir.org.services',
        link: '/pages/ir/service',
        group: 'myorg',
      },
      {
        title: 'menu.ir.org.users',
        link: '/pages/ir/user',
        group: 'myorg',
      },
      {
        title: 'menu.ir.org.vessels',
        link: '/pages/ir/vessel',
        group: 'myorg',
      },
      {
        title: 'menu.ir.org.roles',
        link: '/pages/ir/role',
        group: 'myorg',
      },
      {
        title: 'separator',
      },
      {
        title: 'menu.ir.myir',
      },
      {
        title: 'menu.ir.organizations',
        link: '/pages/ir/organization',
        group: 'ir',
      },
      {
        title: 'menu.ir.admin',
        link: '/pages/ir/orgcandidate',
        group: 'ir',
        forSiteAdmin: true
      },
    ],
  },
  {
    title: 'menu.sr',
    icon: 'layers',
    children: [
      // {
      //   title: 'My Company',
      // },
      // {
      //   title: 'menu.sr.org.services',
      //   link: '/pages/sr/instanceorg',
      //   group: 'myorg',
      // },
      // {
      //   title: 'separator',
      // },
      // {
      //   title: 'My SR',
      // },
      {
        title: 'menu.sr.search',
        link: '/pages/sr/search',
        group: 'mysr'
      },
      {
        title: 'menu.sr.search.map',
        link: '/pages/sr/mapsearch',
        group: 'mysr'
      },
      {
        title: 'menu.sr.instances',
        link: '/pages/sr/instance',
        group: 'mysr'
      },
      // {
      //   title: 'separator',
      // },
      // {
      //   title: 'Global Search',
      // },
      // {
      //   title: 'menu.ledger.search',
      //   link: '/pages/ledger/search',
      //   group: 'global'
      // },
    ],
  },
  {
    title: 'menu.about',
    icon: 'help-info',
    link: '/pages/about',
  },
];

export const MSR_MENU_FOR_ORG = {
  title: 'menu.sr.org',
  children: [
    {
      title: 'menu.sr.org.services',
      link: '/pages/sr/instanceorg',
    },
  ],
};
