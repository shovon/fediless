import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { getPosts } from "./api/posts";
import { Source_Serif_4, Roboto } from "next/font/google";
import parse from "html-react-parser";
import styles from "@/app/page.module.css";
import { format } from "date-fns";

const sourceSerif4 = Source_Serif_4({ subsets: ["latin"] });
const roboto = Roboto({ weight: "400", subsets: ["latin"] });

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
			{posts
				.filter((post) => post.content.trim().length)
				.map((post) => (
					<div
						style={{
							borderBottom: "1px solid black",
						}}
					>
						<article key={post.id}>
							<section className={sourceSerif4.className}>
								{parse(post.content)}
							</section>
							<section
								className={roboto.className}
								style={{
									fontSize: "0.75em",
								}}
							>
								{format(post.createdAt, "MMM dd, yyyy hh:mm a")}
							</section>
						</article>
					</div>
				))}
		</main>
	);
}
