// @ts-check

import { Octokit } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { throttling } from "@octokit/plugin-throttling";

export default Octokit.plugin(paginateRest, throttling).defaults({
  throttle: {
    onRateLimit: (retryAfter, options, octokit) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
      );

      // retry up to 3 times
      if (options.request.retryCount < 2) {
        octokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      octokit.log.warn(
        `SecondaryRateLimit detected for request ${options.method} ${options.url}`
      );

      // retry up to 3 times
      if (options.request.retryCount < 2) {
        octokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
  },
});
