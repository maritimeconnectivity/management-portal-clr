
import * as _ from "lucene-query-string-builder";
import { LogicalOperator } from './localOperator';
import { Term } from "./lucene-component";

export const buildTerm = (data: {[key: string]: any}): string => {
    if (data) {
      const key = Object.keys(data).pop();
      if (key && data[key] !== undefined) {
        return _.field(key, _.term(data[key]));
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
      return _.and( buildQuery(o1), o2.group ? "(" + buildQuery(o2.group) + ")": buildTerm(o2));
    } else if (op['operator'] === LogicalOperator.Or) {
      return _.or( buildQuery(o1), o2.group ? "(" + buildQuery(o2.group) + ")": buildTerm(o2));
    }
  }
  return '';
}
