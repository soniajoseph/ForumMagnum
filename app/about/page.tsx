import React from "react";
import PostsSingleRoute from '@/components/posts/PostsSingleRoute';
import RouteRoot from "@/components/layout/RouteRoot";
import { aboutPostIdSetting } from "@/lib/instanceSettings";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";
import { isWorldDaemons } from "@/lib/forumTypeUtils";
import WorldDaemonsAboutPage from "@/components/about/WorldDaemonsAboutPage";

assertRouteAttributes("/about", {
  whiteBackground: true,
  hasLinkPreview: false,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: true,
});

export default function Page() {
  if (isWorldDaemons()) {
    return <RouteRoot delayedStatusCode>
      <WorldDaemonsAboutPage />
    </RouteRoot>;
  }
  return <RouteRoot delayedStatusCode>
    <PostsSingleRoute _id={aboutPostIdSetting.get()} />
  </RouteRoot>;
}
