import Color from "color"
import { unzipSync } from "fflate"
import JsonUrl from "json-url"

const amoBaseUrl = "https://addons.mozilla.org/api/v4"
const detailEndpoint = id => "/addons/addon/" + id

const jsonCodec = new JsonUrl("lzma")

export async function bufferToTheme(buffer) {
	const xpi = new Uint8Array(buffer)
	const files = unzipSync(xpi)
	const manifest = JSON.parse(new TextDecoder().decode(files["manifest.json"]))

	if (manifest.images && (manifest.images.theme_frame || manifest.images.additional_backgrounds)) {
		throw new Error("Theme with images are not supported")
	}

	return {
		title: manifest.name,
		colors: Object.fromEntries(
			Object.entries(manifest.theme.colors)
				.map(([name, color]) => [name, Color(color).rgb().object()]
			)
		)
	}
}

export async function themeToLink(theme) {
	return `https://color.firefox.com/?theme=${await jsonCodec.compress(theme)}`
}
