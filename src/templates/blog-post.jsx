import React from "react";
import Helmet from "react-helmet";
import { Link, graphql } from "gatsby";
import get from "lodash/get";
import Bio from "../components/Bio";
import Layout from "../components/Layout";
import { formatReadingTime } from "../utils/strings";
import End from "../components/End";
import { scale, rhythm } from "../utils/typography";

function BlogPostTemplate(props) {
	const post = props.data.markdownRemark;
	const siteTitle = get(props, `data.config.frontmatter.title`);
	const siteBio = get(props, "props.data.config.html");
	const siteDescription = post.excerpt;
	const { previous, next } = props.pageContext;

	return (
		<Layout
			location={props.location}
			config={props.data.config}
			translations={post.frontmatter.translations}
		>
			<Helmet
				htmlAttributes={{ lang: props.pageContext.language }}
				meta={[{ name: "description", content: siteDescription }]}
				title={`${post.frontmatter.title} | ${siteTitle}`}
			/>
			<h1 className="mt5">{post.frontmatter.title}</h1>
			<p
				className="text"
				style={{
					...scale(-1 / 8),
					display: "block",
					marginBottom: rhythm(1),
					marginTop: rhythm(-.7),
				}}
			>
				{post.frontmatter.description} - {post.frontmatter.date} -{" "}
				{formatReadingTime(post.timeToRead)}
			</p>
			<div
				className="text"
				dangerouslySetInnerHTML={{ __html: post.html }}
			/>
			{post.frontmatter.useFolks && <End />}
			<hr
				style={{
					marginBottom: rhythm(1),
				}}
			/>
			<ul
				style={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-around",
					listStyle: "none",
					fontFamily: "Montserrat, sans-serif",
					padding: 0,
				}}
			>
				<li>
					{previous && (
						<Link to={previous.fields.slug} rel="prev">
							{"<- "}
							{previous.frontmatter.title}
						</Link>
					)}
				</li>
				<li>
					{next && (
						<Link to={next.fields.slug} rel="next">
							{next.frontmatter.title || "..."} {" ->"}
						</Link>
					)}
				</li>
			</ul>
		</Layout>
	);
}

export default BlogPostTemplate;

export const pageQuery = graphql`
	query BlogPostBySlug($slug: String!, $language: String!) {
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
			}
		}
		markdownRemark(fields: { slug: { eq: $slug } }) {
			id
			excerpt
			html
			timeToRead
			frontmatter {
				title
				date(formatString: "YYYY-MM-DD")
				description
				useFolks
				subjects
				translations
			}
		}
	}
`;
