import { Link } from "gatsby";
import React from "react";
import { rhythm } from "../utils/typography";
import LanguageSwitcher from "./LanguageSwitcher";
import "./index.css";

function Layout({ location, config, children, translations }) {
	let header;

	if (`${__PATH_PREFIX__}${config.fields.slug}` === location.pathname) {
		header = (
			<h1
				style={{
					fontSize: "3.2rem",
					marginBottom: rhythm(1.5),
					fontFamily: "Noto Sans, sans-serif",
					marginTop: 0,
				}}
			>
				<Link
					style={{
						boxShadow: "none",
						textDecoration: "none",
						color: "inherit",
						fontFamily: "Noto Sans, sans-serif",
					}}
					to={config.fields.slug}
				>
					{config.frontmatter.title}
				</Link>
			</h1>
		);
	} else {
		header = (
			<h3
				style={{
					marginTop: 0,
					fontFamily: "Noto Sans, sans-serif",
					marginBottom: rhythm(-1.5),
				}}
			>
				<Link
					style={{
						boxShadow: "none",
						textDecoration: "none",
						color: "inherit",
						fontFamily: "Noto Sans, sans-serif",
					}}
					to={"/"}
				>
					{config.frontmatter.title}
				</Link>
			</h3>
		);
	}
	return (
		<div
			style={{
				marginLeft: "auto",
				marginRight: "auto",
				fontFamily: "Noto Sans, sans-serif",
				maxWidth: rhythm(32),
				padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
			}}
		>
			<LanguageSwitcher
				language={config.frontmatter.language}
				translations={translations}
			/>
			{header}
			{children}
		</div>
	);
}

export default Layout;
