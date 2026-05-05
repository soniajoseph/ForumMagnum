import React from "react";
import PostsSingleRoute from '@/components/posts/PostsSingleRoute';
import RouteRoot from "@/components/layout/RouteRoot";
import { contactPostIdSetting } from "@/lib/instanceSettings";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";
import { isWorldDaemons } from "@/lib/forumTypeUtils";
import WorldDaemonsContactPage from "@/components/about/WorldDaemonsContactPage";

assertRouteAttributes("/contact", {
  whiteBackground: true,
  hasLinkPreview: false,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: true,
});

export default function Page() {
  if (isWorldDaemons()) {
    return <RouteRoot delayedStatusCode>
      <WorldDaemonsContactPage />
    </RouteRoot>;
  }
  return <RouteRoot delayedStatusCode>
    <PostsSingleRoute _id={contactPostIdSetting.get()} />
  </RouteRoot>;
}
