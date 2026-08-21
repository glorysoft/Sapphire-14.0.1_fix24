import { watchModule } from './watch/modules.js';
export const runWatch = (watchData) => {
  for (const [name, { ctx, value }] of watchData) {
    try {
       
      if (name.startsWith('module')) {
        watchModule(ctx, value);
      } else {
        console.info(
          `[${new Date().toLocaleTimeString()}] Start watch: ${name}`,
        );
        ctx.watch();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `[${new Date().toLocaleTimeString()}] Error: ${name} \r\n${error.message}`,
      );
    }
  }
};
