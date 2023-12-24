import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { getPosts } from "./api/posts";
import { Source_Serif_4 } from "next/font/google";
import parse from "html-react-parser";
import styles from "@/app/page.module.css";

const sourceSerif4 = Source_Serif_4({ subsets: ["latin"] });

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
		<main
			className={styles.main}
			style={{
				fontSize: "1.5em",
			}}
		>
			{posts.map((post) => (
				<div
					className={sourceSerif4.className}
					style={{
						borderBottom: "1px solid black",
					}}
					key={post.id}
				>
					{parse(post.content)}
				</div>
			))}
		</main>
	);
}
