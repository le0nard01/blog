import React, { useState, useEffect } from "react";
import { Link, graphql } from "gatsby";
import styled from "styled-components";
import get from "lodash/get";
import Helmet from "react-helmet";
import Bio from "../components/Bio";
import Layout from "../components/Layout";
import { formatReadingTime } from "../utils/strings";
import colors from "../utils/colors";
import Input from "../components/Input";
import { rhythm } from "../utils/typography";

const chars = /[áéíóúãêàâô]/gi;
const myArray = [
	"tricks",
	"javascript",
	"typescript",
	"hooks",
	"react",
	"redux",
	"node",
	"css",
	"frontend",
	"cli",
	"linux",
];

const getRandom = () => myArray[Math.floor(Math.random() * myArray.length)];

const translate = {
	á: "a",
	é: "e",
	í: "i",
	ó: "o",
	ú: "u",
	ã: "a",
	ê: "e",
	à: "a",
	â: "a",
	ô: "o",
};
const normalize = (s) => s.replace(chars, (match) => translate[match]);

const UL = styled.ul`
	margin-left: 0;
	padding: 0;
	margin-bottom: 0;
	& > .tag:not(:empty) {
		display: inline-flex;
		flex-wrap: nowrap;
		margin-right: 0.4rem;
		padding: 0.2rem;
		padding-left: 0.8rem;
		padding-right: 0.8rem;
		background-color: #34619f;
		font-weight: 900;
		letter-spacing: 2px;
		color: #f2f6fc;
	}

	& > .tag:empty {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	& > .tag:not(:empty)::before {
		content: "# ";
	}

	& > .tag:first-child {
		margin-left: 0;
	}
`;

function BlogIndex(props) {
	const [input, setInput] = useState("");
	const [posts, setPosts] = useState(
		get(props, "data.allMarkdownRemark.edges")
	);

	useEffect(() => {
		if (input === "") {
			return setPosts(get(props, "data.allMarkdownRemark.edges"));
		}
		const filter = get(props, "data.allMarkdownRemark.edges").filter(
			({ node }) => {
				const regex = new RegExp(`${normalize(input)}`, "gi");
				const title = get(node, "frontmatter.title") || "";
				const tags =
					node.frontmatter.subjects.filter((x) => !!x.match(regex))
						.length > 0;
				const desc = node.frontmatter.description;
				return (
					[
						tags,
						!!normalize(title).match(regex),
						!!normalize(desc).match(regex),
					].filter(Boolean).length > 0
				);
			}
		);
		setPosts(filter);
	}, [input]);

	const config = get(props, "data.config");
	const siteTitle = get(config, "frontmatter.title");
	const description = get(config, "frontmatter.description");
	const bio = get(config, "html");

	return (
		<Layout location={props.location} config={config}>
			<Helmet
				htmlAttributes={{ lang: props.pageContext.language }}
				meta={[{ name: "description", content: description }]}
				title={siteTitle}
			/>
			<Bio>
				<div dangerouslySetInnerHTML={{ __html: bio }} />
			</Bio>
			<div className="flex justify-center items-center flex-nowrap">
				<div className="w-100" style={{ flex: 2 }}>
					<Input
						placeholder="Qual a boa padrinho?"
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
				</div>
				<div className="w-100 mt2 ml2 flex" style={{ flex: 0 }}>
					<button
						onClick={() => setInput(getRandom())}
						className="bg-animate bg-transparent outline-0 hover-bg-black hover-white pointer b--transparent pa2 br3 white ba b--black f6"
					>
						Surpreenda
					</button>
					<button
						onClick={() => setInput("")}
						className="bg-transparent outline-0 white underline-hover pointer b--transparent pa2 br3 white ba b--black f6"
					>
						Reset
					</button>
				</div>
			</div>
			{posts.map(({ node }) => {
				const title =
					get(node, "frontmatter.title") || node.fields.slug;
				return (
					<div key={node.fields.slug}>
						<h3 style={{ marginBottom: rhythm(1 / 4) }}>
							<Link
								style={{
									boxShadow: "none",
									color: colors.title,
								}}
								to={node.fields.slug}
							>
								{title}
							</Link>
						</h3>
						<small className="text">
							{node.frontmatter.date} -{" "}
							{formatReadingTime(node.timeToRead)}
						</small>
						<UL>
							{node.frontmatter.subjects.map((x) => (
								<li
									key={`${x}-${node.fields.slug}`}
									className="text tag"
									style={{
										marginTop: rhythm(0.2),
									}}
								>
									{x}
								</li>
							))}
						</UL>
						<p className="text mb1">
							<b>{node.frontmatter.description}</b>
						</p>
						<p>
							<span
								className="text"
								dangerouslySetInnerHTML={{
									__html: node.excerpt,
								}}
							/>
						</p>
					</div>
				);
			})}
		</Layout>
	);
}

export default BlogIndex;

export const blogIndexFragment = graphql`
	query BlogPost($language: String!) {
		config: markdownRemark(
			frontmatter: {
				language: { eq: $language }
				type: { eq: "language" }
			}
		) {
			html
			fields {
				slug
			}
			frontmatter {
				title
				language
				description
			}
		}
		allMarkdownRemark(
			sort: { fields: [frontmatter___date], order: DESC }
			filter: {
				frontmatter: { language: { eq: $language }, type: { eq: null } }
			}
		) {
			edges {
				node {
					excerpt
					fields {
						slug
					}
					timeToRead
					frontmatter {
						title
						description
						subjects
						date(formatString: "MMMM DD, YYYY")
					}
				}
			}
		}
	}
`;
