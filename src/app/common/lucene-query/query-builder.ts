
import * as _ from "lucene-query-string-builder";
import { LogicalOperator } from './localOperator';

export const buildTerm = (data: {[key: string]: any}): string => {
    if (data) {
      const key = Object.keys(data).pop();
      if (key && data[key] !== undefined) {
        return _.field(key, _.term(data[key]));
      }
    }
    return '';
}

interface Term {
  operator?: LogicalOperator;
  [key: string]: any;
}

export function buildQuery(terms: Term[]): any {
  if (terms.length === 1) {
    return buildTerm(terms[0]);
  } else if (terms.length >= 3) {
    const op = terms[terms.length - 2];
    if (op['operator'] === LogicalOperator.And) {
      return _.and(buildQuery(terms.slice(0, terms.length - 2)), buildTerm(terms[terms.length - 1]));
    } else if (op['operator'] === LogicalOperator.Or) {
      return _.or(buildQuery(terms.slice(0, terms.length - 2)), buildTerm(terms[terms.length - 1]));
    }
  }
}