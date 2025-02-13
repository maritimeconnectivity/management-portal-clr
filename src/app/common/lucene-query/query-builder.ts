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
import { Term } from "./lucene-component";
import * as lucene from 'lucene-query-string-builder';

export const buildTerm = (data: {[key: string]: any}): string => {
    if (data) {
      const key = Object.keys(data).pop();
      if (key && data[key] !== undefined) {
        return lucene.field(key, lucene.term(data[key]));
      }
    }
    return '';
}

export function buildQuery(terms: Term[]): string {
  if (terms.length === 1) {
    return terms[0].group ? "(" + buildQuery(terms[0].group) + ")": buildTerm(terms[0]);
  } else if (terms.length >= 3) {
    const op = terms[terms.length - 2];
    const o1 = terms.slice(0, terms.length - 2);
    const o2 = terms[terms.length - 1];
    if (op['operator'] === LogicalOperator.And) {
      return lucene.and( buildQuery(o1), o2.group ? "(" + buildQuery(o2.group) + ")": buildTerm(o2));
    } else if (op['operator'] === LogicalOperator.Or) {
      return lucene.or( buildQuery(o1), o2.group ? "(" + buildQuery(o2.group) + ")": buildTerm(o2));
    }
  }
  return '';
}
