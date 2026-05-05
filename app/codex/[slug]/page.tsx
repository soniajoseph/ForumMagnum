import React from "react";
import PostsSingleSlug from '@/components/posts/PostsSingleSlug';
import { getDefaultMetadata, getPageTitleFields } from "@/server/pageMetadata/sharedMetadata";
import type { Metadata } from "next";
import merge from "lodash/merge";
import RouteRoot from "@/components/layout/RouteRoot";
import { assertRouteAttributes } from "@/lib/routeChecks/assertRouteAttributes";
import { isWorldDaemons } from "@/lib/forumTypeUtils";
import Error404 from "@/components/common/Error404";

export async function generateMetadata(): Promise<Metadata> {
  return merge({}, await getDefaultMetadata(), getPageTitleFields('SlateStarCodex'));
}

assertRouteAttributes("/codex/[slug]", {
  whiteBackground: true,
  hasLinkPreview: true,
  hasPingbacks: true,
  hasLeftNavigationColumn: false,
  hasMarkdownVersion: true,
});

export default async function Page({ params }: {
  params: Promise<{ slug: string }>
}) {
  if (isWorldDaemons()) {
    return <RouteRoot><Error404/></RouteRoot>;
  }
  const { slug } = await params;
  return <RouteRoot delayedStatusCode subtitle={{
    title: 'SlateStarCodex',
    link: '/codex',
  }}>
    <PostsSingleSlug slug={slug} />
  </RouteRoot>;
}
