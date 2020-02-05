import React from "react";
import img from "../assets/allfolks.gif";
import Share from "./Share";

export default ({ text, title, route }) => {
	return (
		<div style={{ width: "100%" }}>
			<Share text={text} route={route} title={title} />
			<img
				style={{ minWidth: "15rem" }}
				className="w-30 flex justify-center center tc"
				src={img}
			/>
		</div>
	);
};
