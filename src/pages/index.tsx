import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { getPosts } from "./api/posts";
import parse from "html-react-parser";

type Repo = {
	name: string;
	stargazers_count: number;
};

type ExtractPromiseType<T> = T extends Promise<infer U> ? U : T;

export const getServerSideProps = (async () => {
	return { props: { posts: await getPosts() } };
}) satisfies GetServerSideProps<{
	posts: ExtractPromiseType<ReturnType<typeof getPosts>>;
}>;

export default function Index({
	posts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<main>
			{posts.map((post) => (
				<div key={post.id}>{parse(post.content)}</div>
			))}
		</main>
	);
}
