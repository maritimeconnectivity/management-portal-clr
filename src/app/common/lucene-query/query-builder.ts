import _ from "lucene-query-string-builder";
import { LogicalOperator } from '../model/localOperator';

export const buildTerm = (data: object) => {
    if (data) {
      const key = Object.keys(data).pop();
      return key && data[key] !== undefined &&  _.field(key, _.term(data[key]));
    }
}

export function buildQuery(terms: object[]) {
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
