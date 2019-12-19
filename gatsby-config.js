module.exports = {
	siteMetadata: {
		siteUrl: "https://blog.garcez.now.sh",
		author: "Allan Garcez",
		title: "Draft Room",
		description:
			"O lugar dos rascunhos de ideia de um viajante na maionese",
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
							maxWidth: 590,
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
		`gatsby-plugin-feed`,
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `Gatsby Starter Blog`,
				short_name: `GatsbyJS`,
				start_url: `/`,
				background_color: `#202020`,
				theme_color: `#9cbdc9`,
				display: `minimal-ui`,
				icon: `src/assets/gatsby-icon.png`,
			},
		},
		`gatsby-plugin-offline`,
		`gatsby-plugin-react-helmet`,
	],
};
