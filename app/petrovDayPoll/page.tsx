import React from "react";
import PetrovDayPoll from '@/components/seasonal/petrovDay/PetrovDayPoll';
import RouteRoot from "@/components/layout/RouteRoot";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";
import { isWorldDaemons } from "@/lib/forumTypeUtils";
import Error404 from "@/components/common/Error404";

assertRouteAttributes("/petrovDayPoll", {
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
    <PetrovDayPoll />
  </RouteRoot>
}
