import React from "react";
import SequencesHighlightsCollection from '@/components/sequences/SequencesHighlightsCollection';
import { getDefaultMetadata, getPageTitleFields } from "@/server/pageMetadata/sharedMetadata";
import type { Metadata } from "next";
import merge from "lodash/merge";
import RouteRoot from "@/components/layout/RouteRoot";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";
import { isWorldDaemons } from "@/lib/forumTypeUtils";
import Error404 from "@/components/common/Error404";

export async function generateMetadata(): Promise<Metadata> {
  return merge({}, await getDefaultMetadata(), getPageTitleFields('Sequences Highlights'));
}

assertRouteAttributes("/highlights", {
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
    <SequencesHighlightsCollection />
  </RouteRoot>
}
