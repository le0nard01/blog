import React from "react";
import styled from "styled-components";
import colors from "../utils/colors";

export const Styles = styled.div.attrs(
	({
		borderBottomActiveColor = colors.text,
		labelColor = colors.textAlpha,
		borderBottomColor = colors.title,
		size = 1,
		...props
	}) => ({
		...props,
		size,
		labelColor,
		borderBottomColor,
		borderBottomActiveColor,
	})
)`
	width: 100%;
	position: relative;
	background-color: transparent;
	font-family: "Didact Gothic", sans-serif;
	input {
		color: ${colors.text};
		background-color: transparent;
		font-size: ${(props) => 1.4 * props.size}rem;
		padding: 1rem 0 0 0;
		display: block;
		width: 100%;
		border: none;
		border-bottom: 1px solid ${(props) => props.borderBottomColor};
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type="number"] {
		-moz-appearance: textfield;
	}
	input:focus {
		outline: none;
	}
	label {
		color: ${(props) => props.labelColor};
		font-size: ${(props) => props.size * 1.1}rem;
		font-weight: bolder;
		position: absolute;
		pointer-events: none;
		top: 1.1rem;
		transition: 400ms ease all;
	}
	input:focus ~ label,
	input:not([value=""]) ~ label {
		top: -0.25rem;
		font-size: 0.75rem;
		color: ${(props) => props.borderBottomActiveColor};
	}
	.bar {
		position: relative;
		display: block;
		width: 100%;
	}
	.bar:before,
	.bar:after {
		content: "";
		height: 1px;
		width: 0;
		bottom: 1px;
		position: absolute;
		background: ${(props) => props.borderBottomActiveColor};
		transition: ${(props) => props.transition}ms ease all;
	}
	.bar:before {
		left: 50%;
	}
	.bar:after {
		right: 50%;
	}
	input:focus ~ .bar:before,
	input:focus ~ .bar:after {
		width: 50%;
	}
	.highlight {
		position: absolute;
		height: 1px;
		width: 100%;
		top: 25%;
		left: 0;
		pointer-events: none;
		opacity: 0.5;
	}
	input:focus ~ .highlight {
		animation: inputHighlighter ${(props) => props.transition}ms ease;
	}
	@-webkit-keyframes inputHighlighter {
		from {
			background: ${(props) => props.borderBottomActiveColor};
		}
		to {
			width: 0;
			background: transparent;
		}
	}
	@-moz-keyframes inputHighlighter {
		from {
			background: ${(props) => props.borderBottomActiveColor};
		}
		to {
			width: 0;
			background: transparent;
		}
	}
	@keyframes inputHighlighter {
		from {
			background: ${(props) => props.borderBottomActiveColor};
		}
		to {
			width: 0;
			background: transparent;
		}
	}
`;

const Input = ({
	disabled = false,
	fontSize = 1,
	divClassName = "",
	divStyle = {},
	labelClassName = "",
	labelColor = colors.text,
	labelStyle,
	loaderColor = colors.text,
	loading = false,
	mask: maskType,
	message,
	name,
	placeholder = "",
	lineAnimationTime = 500,
	type = "text",
	className = "",
	value = "",
	...inputHtml
}) => {
	const labelInternalStyle = {
		width: "100%",
		color: labelColor,
		cursor: disabled ? "not-allowed" : "pointer",
		...labelStyle,
	};

	const containerProps = {
		style: divStyle,
		className: divClassName,
		size: fontSize,
		transition: lineAnimationTime,
	};
	const internalInputStyle = {
		cursor: disabled ? "not-allowed" : "pointer",
		...inputHtml.style,
	};

	const inputCommonProps = {
		className: `${className}${disabled ? " not-allowed" : ""}`,
		style: internalInputStyle,
		name,
		id: name,
		value,
		disabled,
	};

	const Label = (
		<label
			style={labelInternalStyle}
			title={placeholder}
			htmlFor={name}
			className={labelClassName}
		>
			{placeholder}
		</label>
	);
	return (
		<Styles {...containerProps}>
			<input {...inputHtml} {...inputCommonProps} />
			<span className="bar" />
			{Label}
		</Styles>
	);
};

export default Input;
