import React from "react";
import Leaderboard from '@/components/users/Leaderboard';
import RouteRoot from "@/components/layout/RouteRoot";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";
import { isWorldDaemons } from "@/lib/forumTypeUtils";
import Error404 from "@/components/common/Error404";

assertRouteAttributes("/leaderboard", {
  whiteBackground: false,
  hasLinkPreview: false,
  hasPingbacks: false,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: false,
});

export default function Page() {
  if (isWorldDaemons()) {
    return <RouteRoot><Error404/></RouteRoot>;
  }
  return <RouteRoot>
    <Leaderboard />
  </RouteRoot>
}
