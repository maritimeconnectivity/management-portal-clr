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

import { LogicalOperator } from './localOperator';
import { QueryFieldInfo } from './queryFieldInfo';
import { EventEmitter } from "@angular/core";

export interface LuceneComponent {
    id: string;
    data: Term;
    fieldInfo?: QueryFieldInfo[];
    onUpdate: EventEmitter<any>;
    onDelete: EventEmitter<any>;
    onAdd?: EventEmitter<any>;
    onExtend?: EventEmitter<any>;

    generateItems?(data: Term, fieldInfo: QueryFieldInfo[]): void;
}

export interface Term {
  id: string;
  operator?: LogicalOperator;
  group?: Term[];
  [key: string]: any;
}