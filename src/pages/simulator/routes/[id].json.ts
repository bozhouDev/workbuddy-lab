import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const routes = await getCollection('routes');
  return routes.map((entry) => ({
    params: { id: entry.id },
    props: { route: { id: entry.id, ...entry.data } },
  }));
}

export const GET: APIRoute = ({ props }) => {
  return new Response(JSON.stringify(props.route), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
