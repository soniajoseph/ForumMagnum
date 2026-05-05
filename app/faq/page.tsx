import React from "react";
import PostsSingleRoute from '@/components/posts/PostsSingleRoute';
import RouteRoot from "@/components/layout/RouteRoot";
import { faqPostIdSetting } from "@/lib/instanceSettings";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";
import { isWorldDaemons } from "@/lib/forumTypeUtils";
import Error404 from "@/components/common/Error404";

assertRouteAttributes("/faq", {
  whiteBackground: true,
  hasLinkPreview: false,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: true,
});

export default function Page() {
  // No FAQ for WorldDaemons yet — /about covers the equivalent ground.
  if (isWorldDaemons()) {
    return <RouteRoot><Error404/></RouteRoot>;
  }
  return <RouteRoot delayedStatusCode>
    <PostsSingleRoute _id={faqPostIdSetting.get()} />
  </RouteRoot>;
}
