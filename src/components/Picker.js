import { useCallback, useEffect, useState } from "preact/hooks"
import { bufferToTheme, themeToLink } from "../theme.js"

export default function Picker() {
	const [theme, setTheme] = useState(null)

	return (
		<>
			<Text onTheme={setTheme} />
			<File onTheme={setTheme} />

			{theme && <>
				<hr />
				<Result theme={theme} />
			</>}
		</>
	)
}

// https://addons.mozilla.org/(\w)/firefox/addon/([\w-]+)
function Text({ onTheme }) {
	const handleChange = useCallback(
		async ({ target: { value } }) => {
			const url = await handleStringUrl(value)

			if (url) {
				const response = await fetch(url)
				onTheme(await bufferToTheme(await response.arrayBuffer()))
			}

		},
		[onTheme]
	)

	return <input type="text" onInput={handleChange}/>
}

function File({ onTheme }) {
	const handleChange = useCallback(
		async ({ target: { files: [file] } }) => {
			if (file) {
				onTheme(await bufferToTheme(await file.arrayBuffer()))
			}
		},
		[onTheme]
	)

	return (
		<input type="file" accept=".xpi" onChange={handleChange}/>
	)
}

function Result({ theme }) {
	const [link, setLink] = useState(null)

	useEffect(() => {
		(async () => {
			setLink(await themeToLink(theme))
		})()
	}, [theme])


	if (!link) {
		return
	}

	return <a href={link} target="_blank" rel="noopener">{`Open ${theme.title} on Firefox Color`}</a>
}


// addons.mozilla.org/firefox/downloads/latest/ADDON_NAME/addon-ADDON_ACCOUNT_ID-latest.xpi


async function handleStringUrl(string) {
	try {
		const url = new URL(string)

		{
			const matched = url.pathname.match(/\.(?<extension>\w+)$/i)

			if (matched !== null && matched.groups.extension === 'xpi') {
				console.log("xpi url")
				return url

			}
		}


		{
			if (url.hostname === 'addons.mozilla.org') {
				const matched = url.pathname.match(/^\/[\w-]+\/firefox\/addon\/(?<id>[\w-]+)/i)

				if (matched !== null) {
					console.log("addon url")
					console.info("addon url not supported yet")
					return null
				}
			}
		}

		{
			console.log("other url")
			console.info("other url not supported yet")
			return null
		}
	} catch (error) {
		if (error instanceof TypeError) {
			console.log("text")
			console.info("text not supported yet")
			return null
		} else {
			throw error
		}
	}
}
