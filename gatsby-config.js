module.exports = {
	siteMetadata: {
		siteUrl: "https://blog.garcez.now.sh",
		author: "Allan Garcez",
		github: "https://github.com/g4rcez",
		title: "Draft Room",
		description: "O lugar onde saem os rascunhos e experiências",
	},
	pathPrefix: "/gatsby-starter-i18n-blog",
	plugins: [
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				path: `${__dirname}/src/pages`,
				name: "pages",
			},
		},
		{
			resolve: `gatsby-transformer-remark`,
			options: {
				plugins: [
					{
						resolve: `gatsby-remark-images`,
						options: {
							maxWidth: 600,
						},
					},
					{
						resolve: `gatsby-remark-responsive-iframe`,
						options: {
							wrapperStyle: `margin-bottom: 1.0725rem`,
						},
					},
					"gatsby-remark-prismjs",
					"gatsby-remark-copy-linked-files",
					"gatsby-remark-smartypants",
					{
						resolve: "gatsby-remark-emojis",
						options: {
							// Deactivate the plugin globally (default: true)
							active: true,
							// Add a custom css class
							class: "emoji-icon",
							// Select the size (available size: 16, 24, 32, 64)
							size: 64,
							// Add custom styles
							styles: {
								display: "inline",
								margin: "0",
								"margin-top": "1px",
								position: "relative",
								top: "5px",
								width: "25px",
							},
						},
					},
				],
			},
		},
		`gatsby-transformer-sharp`,
		`gatsby-plugin-sharp`,
		{
			resolve: `gatsby-plugin-google-analytics`,
			options: {
				//trackingId: `ADD YOUR TRACKING ID HERE`,
			},
		},
		{
			resolve: `gatsby-plugin-feed`,
			options: {
				query: `
				{
				  site {
					siteMetadata {
					  title
					  description
					  siteUrl
					  site_url: siteUrl
					}
				  }
				}
			  `,
				feeds: [
					{
						serialize: ({ query: { site, allMarkdownRemark } }) => {
							return allMarkdownRemark.edges.map((edge) => {
								return Object.assign(
									{},
									edge.node.frontmatter,
									{
										description: edge.node.excerpt,
										date: edge.node.frontmatter.date,
										url:
											site.siteMetadata.siteUrl +
											edge.node.fields.slug,
										guid:
											site.siteMetadata.siteUrl +
											edge.node.fields.slug,
										custom_elements: [
											{
												"content:encoded":
													edge.node.html,
											},
										],
									}
								);
							});
						},
						query: `
					{
					  allMarkdownRemark(
						sort: { order: DESC, fields: [frontmatter___date] },
					  ) {
						edges {
						  node {
							excerpt
							html
							fields { slug }
							frontmatter {
							  title
							  date
							}
						  }
						}
					  }
					}
				  `,
						output: "/rss.xml",
						title: "Draft Room, by Allan Garcez",
					},
				],
			},
		},
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `Gatsby Starter Blog`,
				short_name: `GatsbyJS`,
				start_url: `/`,
				background_color: `#202020`,
				theme_color: `#21252f`,
				display: `minimal-ui`,
				icon: `src/assets/gatsby-icon.png`,
			},
			feeds: [
				{
					serialize: ({ query: { site, allMarkdownRemark } }) => {
						return allMarkdownRemark.edges.map((edge) => {
							return Object.assign({}, edge.node.frontmatter, {
								description: edge.node.excerpt,
								date: edge.node.frontmatter.date,
								url:
									site.siteMetadata.siteUrl +
									edge.node.fields.slug,
								guid:
									site.siteMetadata.siteUrl +
									edge.node.fields.slug,
								custom_elements: [
									{ "content:encoded": edge.node.html },
								],
							});
						});
					},
					query: `
					{
					  allMarkdownRemark(
						sort: { order: DESC, fields: [frontmatter___date] },
					  ) {
						edges {
						  node {
							excerpt
							html
							fields { slug }
							frontmatter {
							  title
							  date
							}
						  }
						}
					  }
					}
				  `,
					output: "/rss.xml",
				},
				`gatsby-plugin-offline`,
				`gatsby-plugin-react-helmet`,
			],
		},
	],
};
