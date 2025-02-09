import { inspect } from 'util';

export const logWhole = (identifier: string, message: any) => {
  console.log(
    `${identifier} :>> `,
    inspect(message, { depth: null, showHidden: true }),
  );
};
