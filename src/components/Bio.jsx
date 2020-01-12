import React from "react";
import profilePic from "./profile-pic.jpg";
import { rhythm } from "../utils/typography";

const Bio = ({ children }) => {
	return (
		<div style={{ display: "flex", marginBottom: rhythm(0) }}>
			<img
				src={profilePic}
				alt={`Allan Garcez`}
				style={{
					marginRight: rhythm(1 / 2),
					marginBottom: 0,
					borderRadius: "50%",
					width: rhythm(2),
					height: rhythm(2),
				}}
			/>
			{children}
		</div>
	);
};

export default Bio;
