import { expectType } from "tsd";
import GitHubProject from "./index";

export async function smoke() {
  expectType<typeof GitHubProject>(GitHubProject);
}
