import React from "react";

const replaceLocalhost = (url = "") =>
	url.replace("http://localhost:8000/", "https://blog.garcez.now.sh/");

const url = (u) => encodeURIComponent(replaceLocalhost(u));

const svg =
	"no-underline near-white bg-animate bg-near-black hover-bg-gray inline-flex items-center ma2 tc br2 pa2";

export default ({ text, title, route }) => {
	const share = url(route);
	return (
		<div className="w-30 flex justify-center center tc">
			<a
				target="_blank"
				className={`${svg} hover-facebook`}
				href={`https://www.facebook.com/sharer/sharer.php?u=${share}`}
				title="Facebook"
			>
				<svg
					class="dib h2 w2"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill-rule="evenodd"
					clip-rule="evenodd"
					strokeLinejoin="round"
					strokeMiterlimit="1.414"
				>
					<path
						d="M15.117 0H.883C.395 0 0 .395 0 .883v14.234c0 .488.395.883.883.883h7.663V9.804H6.46V7.39h2.086V5.607c0-2.066 1.262-3.19 3.106-3.19.883 0 1.642.064 1.863.094v2.16h-1.28c-1 0-1.195.476-1.195 1.176v1.54h2.39l-.31 2.416h-2.08V16h4.077c.488 0 .883-.395.883-.883V.883C16 .395 15.605 0 15.117 0"
						fill-rule="nonzero"
					/>
				</svg>
				<span class="f6 ml3 pr2">Facebook</span>
			</a>
			<a
				target="_blank"
				className={`${svg} hover-linkedin`}
				href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`}
				title="LinkedIn"
			>
				<svg
					style={{
						fillRule: "evenodd",
						clipRule: "evenodd",
						strokeLinejoin: "round",
						strokeMiterlimit: 1.41421,
					}}
					className="dib h2 w2"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill-rule="evenodd"
					clip-rule="evenodd"
					strokeLinejoin="round"
					strokeMiterlimit="1.414"
				>
					<path
						d="M13.632 13.635h-2.37V9.922c0-.886-.018-2.025-1.234-2.025-1.235 0-1.424.964-1.424 1.96v3.778h-2.37V6H8.51V7.04h.03c.318-.6 1.092-1.233 2.247-1.233 2.4 0 2.845 1.58 2.845 3.637v4.188zM3.558 4.955c-.762 0-1.376-.617-1.376-1.377 0-.758.614-1.375 1.376-1.375.76 0 1.376.617 1.376 1.375 0 .76-.617 1.377-1.376 1.377zm1.188 8.68H2.37V6h2.376v7.635zM14.816 0H1.18C.528 0 0 .516 0 1.153v13.694C0 15.484.528 16 1.18 16h13.635c.652 0 1.185-.516 1.185-1.153V1.153C16 .516 15.467 0 14.815 0z"
						fill-rule="nonzero"
					/>
				</svg>
				<span class="f6 ml3 pr2">LinkedIn</span>
			</a>
			<a
				target="_blank"
				class={`${svg} hover-twitter`}
				href={`http://twitter.com/share?url=${share}&text=${text}`}
				title="Twitter"
			>
				<svg
					class="dib h2 w2"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill-rule="evenodd"
					clip-rule="evenodd"
					stroke-linejoin="round"
					stroke-miterlimit="1.414"
				>
					<path
						d="M16 3.038c-.59.26-1.22.437-1.885.517.677-.407 1.198-1.05 1.443-1.816-.634.375-1.337.648-2.085.795-.598-.638-1.45-1.036-2.396-1.036-1.812 0-3.282 1.468-3.282 3.28 0 .258.03.51.085.75C5.152 5.39 2.733 4.084 1.114 2.1.83 2.583.67 3.147.67 3.75c0 1.14.58 2.143 1.46 2.732-.538-.017-1.045-.165-1.487-.41v.04c0 1.59 1.13 2.918 2.633 3.22-.276.074-.566.114-.865.114-.21 0-.416-.02-.617-.058.418 1.304 1.63 2.253 3.067 2.28-1.124.88-2.54 1.404-4.077 1.404-.265 0-.526-.015-.783-.045 1.453.93 3.178 1.474 5.032 1.474 6.038 0 9.34-5 9.34-9.338 0-.143-.004-.284-.01-.425.64-.463 1.198-1.04 1.638-1.7z"
						fill-rule="nonzero"
					/>
				</svg>
				<span class="f6 ml3 pr2">Twitter</span>
			</a>
			<a
				target="_blank"
				className={`${svg} hover-telegram`}
				href={`https://t.me/share/url?url=${share}&text=${text}`}
				title="Telegram"
			>
				<svg
					width="24px"
					height="24px"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					style={{
						fillRule: "evenodd",
						clipRule: "evenodd",
						strokeLinejoin: "round",
						strokeMiterlimit: 1.41421,
					}}
					className="dib h2 w2"
					fill="currentColor"
				>
					<path
						id="telegram-1"
						d="M18.384,22.779c0.322,0.228 0.737,0.285 1.107,0.145c0.37,-0.141 0.642,-0.457 0.724,-0.84c0.869,-4.084 2.977,-14.421 3.768,-18.136c0.06,-0.28 -0.04,-0.571 -0.26,-0.758c-0.22,-0.187 -0.525,-0.241 -0.797,-0.14c-4.193,1.552 -17.106,6.397 -22.384,8.35c-0.335,0.124 -0.553,0.446 -0.542,0.799c0.012,0.354 0.25,0.661 0.593,0.764c2.367,0.708 5.474,1.693 5.474,1.693c0,0 1.452,4.385 2.209,6.615c0.095,0.28 0.314,0.5 0.603,0.576c0.288,0.075 0.596,-0.004 0.811,-0.207c1.216,-1.148 3.096,-2.923 3.096,-2.923c0,0 3.572,2.619 5.598,4.062Zm-11.01,-8.677l1.679,5.538l0.373,-3.507c0,0 6.487,-5.851 10.185,-9.186c0.108,-0.098 0.123,-0.262 0.033,-0.377c-0.089,-0.115 -0.253,-0.142 -0.376,-0.064c-4.286,2.737 -11.894,7.596 -11.894,7.596Z"
					/>
				</svg>
				<span class="f6 ml3 pr2">Telegram</span>
			</a>
			<a
				target="_blank"
				className={`${svg} hover-reddit`}
				href={`https://reddit.com/submit?url=${share}&title=${title}`}
				title="Reddit"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="white"
				>
					<path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 11.889c0-.729-.596-1.323-1.329-1.323-.358 0-.681.143-.92.373-.905-.595-2.13-.975-3.485-1.023l.742-2.334 2.008.471-.003.029c0 .596.487 1.082 1.087 1.082.599 0 1.086-.485 1.086-1.082s-.488-1.082-1.087-1.082c-.46 0-.852.287-1.01.69l-2.164-.507c-.094-.023-.191.032-.22.124l-.827 2.603c-1.419.017-2.705.399-3.65 1.012-.237-.219-.552-.356-.9-.356-.732.001-1.328.594-1.328 1.323 0 .485.267.905.659 1.136-.026.141-.043.283-.043.429-.001 1.955 2.404 3.546 5.359 3.546 2.956 0 5.36-1.591 5.36-3.546 0-.137-.015-.272-.038-.405.416-.224.703-.657.703-1.16zm-8.612.908c0-.434.355-.788.791-.788.436 0 .79.353.79.788 0 .434-.355.787-.79.787-.436.001-.791-.352-.791-.787zm4.53 2.335c-.398.396-1.024.589-1.912.589l-.007-.001-.007.001c-.888 0-1.514-.193-1.912-.589-.073-.072-.073-.19 0-.262.072-.072.191-.072.263 0 .325.323.864.481 1.649.481l.007.001.007-.001c.784 0 1.324-.157 1.649-.481.073-.072.19-.072.263 0 .073.072.073.19 0 .262zm-.094-1.547c-.436 0-.79-.353-.79-.787 0-.434.355-.788.79-.788.436 0 .79.353.79.788 0 .434-.354.787-.79.787z" />
				</svg>
				<span class="f6 ml3 pr2">Reddit</span>
			</a>
		</div>
	);
};
