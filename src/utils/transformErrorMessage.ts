import * as errors from './errors.json';

export const e = (model: string, code: string): string => {
	return errors[model][code].message;
};
