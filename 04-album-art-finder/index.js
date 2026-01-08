/*
=-=-=-=-=-=-=-=-=-=-=-=-
Album Art Search
=-=-=-=-=-=-=-=-=-=-=-=-
Student ID:
Comment (Required):

=-=-=-=-=-=-=-=-=-=-=-=-
*/
const fs = require('fs'); // Node filesystem API for reading/writing files used by this app.
const http = require('http'); // Node HTTP server API used to accept browser requests.
const https = require('https'); // Node HTTPS client API used to call Spotify and download images.
const path = require('path'); // Node path utilities used to build OS-safe file paths.
const querystring = require('querystring'); // Helper to build URL-encoded query strings for Spotify.
const port = 3000; // The local port number this server listens on.
const server = http.createServer(); // Create the HTTP server instance.
const {client_id, client_secret} = require('./credentials.js'); // Spotify credentials used for OAuth.

// Local folders for cached JSON and album art images.
const ALBUM_ART_DIR = path.join(__dirname, "album-art"); // Absolute path to store downloaded album art.
const CACHE_DIR = path.join(__dirname, "cache"); // Absolute path to store cached Spotify JSON.

ensure_directory(ALBUM_ART_DIR); // Create the album art directory if it does not exist.
ensure_directory(CACHE_DIR); // Create the cache directory if it does not exist.

// Teaching note: the block comment below explains stream piping (not executable code).
/*
========================================
Piping in Node.js Streams
========================================

	const readStream = fs.createReadStream('file.txt');
	readStream.pipe(res);

Here, 'readStream' reads data from 'file.txt' and 'pipe' sends that data directly to the HTTP response 'res'. This avoids manual reading and writing of chunks, making the code simpler and more efficient.

In your code:
	const main = fs.createReadStream("html/main.html");
	main.pipe(res);
This reads 'main.html' and pipes its contents to the client as the HTTP response.
========================================
*/
server.on("request", connection_handler); // Route every incoming request to our handler.
// Main router for incoming HTTP requests.
function connection_handler(req, res){ // Called once per HTTP request.
	console.log(`New Request for ${req.url} from ${req.socket.remoteAddress}`); // Log request path + client IP.
	if (req.url=="/" || req.url=="/index.html"){ // If the browser requests the home page.
		return stream_file(res, path.join(__dirname, "html", "main.html"), "text/html"); // Serve main HTML.
	}
	else if (req.url=="/favicon.ico"){ // If the browser requests the favicon.
		return stream_file(res, path.join(__dirname, "images", "favicon.ico"), "image/x-icon"); // Serve favicon.
	}
	else if (req.url=="/images/banner.jpg") { // If the banner image is requested.
		return stream_file(res, path.join(__dirname, "images", "banner.jpg"), "image/jpeg"); // Serve banner image.
	}
	else if (req.url.startsWith("/album-art/")){ // If a cached album art image is requested.
		return serve_album_art(req, res); // Resolve and stream that image from disk.
	}
	else if (req.url.startsWith("/search")){ // If the request is a search query (form submit).
		return handle_search(req, res); // Parse the query and fetch results.
	}
	return send_text(res, 404, "404 Not Found"); // Fall back to 404 for unknown routes.
}

// Create a directory (and parents) if it does not exist.
function ensure_directory(dir){ // Utility used at startup for cache folders.
	if (!fs.existsSync(dir)){ // Check whether the directory already exists.
		fs.mkdirSync(dir, {recursive: true}); // Create the directory and any missing parents.
	}
}

// Stream a file to the response with a fixed Content-Type.
function stream_file(res, file_path, content_type){ // Serve static files like HTML or images.
	const stream=fs.createReadStream(file_path); // Open the file as a readable stream.
	stream.on("ready", () => { // Wait until the stream is ready before sending headers.
		res.writeHead(200, {"Content-Type": content_type}); // Send success status and MIME type.
		stream.pipe(res); // Pipe file bytes straight to the HTTP response.
	});
	stream.on("error", () => send_text(res, 404, "404 File Not Found")); // Respond 404 if file read fails.
}

// Send a plain-text response, respecting headers already sent.
function send_text(res, status, message){ // Generic error/success text response helper.
	if (res.headersSent){ // If headers are already sent, avoid double writes.
		return res.end(); // Just end the response to prevent errors.
	}
	res.writeHead(status, {"Content-Type": "text/plain"}); // Set status code and text MIME type.
	res.end(message); // Send the response body and finish the request.
}

// Serve cached album art files from disk.
function serve_album_art(req, res){ // Handles requests like /album-art/<id>.jpg.
	const url = new URL(req.url, `http://${req.headers.host}`); // Parse request URL using current host.
	const filename = path.basename(url.pathname); // Extract just the filename to prevent path traversal.
	if (!filename || filename==="album-art"){ // Guard against missing/invalid filenames.
		return send_text(res, 404, "404 Image Not Found"); // Respond with 404 for invalid requests.
	}
	const file_path = path.join(ALBUM_ART_DIR, filename); // Build absolute path to the image file.
	return stream_file(res, file_path, "image/jpeg"); // Stream the image as a JPEG response.
}

// Handle /search requests: validate input, hit cache, or fetch from Spotify.
function handle_search(req, res){ // Main entry point for search results.
	const url = new URL(req.url, `http://${req.headers.host}`); // Parse the URL to access query params.
	const artist = (url.searchParams.get("artist") || "").trim(); // Read and trim the artist query.
	if (!artist){ // If the user submitted an empty artist name.
		return send_text(res, 400, "Missing artist name."); // Send a 400 Bad Request.
	}
	if (!client_id || !client_secret){ // If credentials were not configured.
		return send_text(res, 500, "Missing Spotify credentials."); // Send a server error.
	}
	const cache_path = path.join(CACHE_DIR, `${safe_filename(artist)}.json`); // Cache file path for this artist.
	fs.readFile(cache_path, "utf8", (err, data) => { // Try to read a cached Spotify response.
		if (!err){ // If cache file read succeeded.
			try{ // Attempt to parse the cached JSON.
				const cached = JSON.parse(data); // Convert cached string into an object.
				return handle_spotify_results(artist, cached, res); // Use cached results to render.
			}catch (parse_err){ // If cached JSON is corrupted.
				// Fall through to re-fetch when cache is invalid.
			}
		}else if (err.code !== "ENOENT"){ // If read failed for a reason other than missing file.
			return send_text(res, 500, "Cache read error."); // Return a server error.
		}
		request_access_token(artist, res, cache_path); // Cache miss: fetch fresh data from Spotify.
	});
}

// Request a Spotify API access token using client credentials.
function request_access_token(artist, res, cache_path){ // Starts the OAuth client-credentials flow.
	const base64data = Buffer.from(`${client_id}:${client_secret}`).toString("base64"); // Encode credentials.
	const post_data = querystring.stringify({grant_type: "client_credentials"}); // Form body for token request.
	const options = { // Options for the HTTPS token request.
		method: "POST", // Spotify requires POST for token endpoint.
		headers:{ // Headers for the token request.
			"Authorization": `Basic ${base64data}`, // Basic auth with client ID/secret.
			"Content-Type": "application/x-www-form-urlencoded", // Form-encoded request body.
			"Content-Length": Buffer.byteLength(post_data) // Explicit body length for streaming.
		}
	};

	const token_endpoint = "https://accounts.spotify.com/api/token"; // Spotify OAuth token URL.
	const token_request=https.request(token_endpoint, options, (token_stream) => { // Send request.
		collect_json(token_stream, (status, data) => { // Read and parse token response JSON.
			if (status !== 200 || !data || !data.access_token){ // Validate success and access token.
				return send_text(res, 502, "Spotify token request failed."); // Fail if token missing.
			}
			search_spotify(artist, data.access_token, res, cache_path); // Use token to search.
		});
	});
	token_request.on("error", () => send_text(res, 502, "Spotify token request failed.")); // Network error.
	token_request.end(post_data); // Send the request body and finish the request.
}

// Search Spotify for albums and cache the response.
function search_spotify(artist, access_token, res, cache_path){ // Search for albums by artist.
	const query = querystring.stringify({q: artist, type: "album", limit: 12}); // Build search query.
	const options = { // Options for the HTTPS search request.
		headers: { // Headers for the search request.
			"Authorization": `Bearer ${access_token}` // OAuth token for Spotify API access.
		}
	};
	const search_endpoint = `https://api.spotify.com/v1/search?${query}`; // Full search URL.
	const search_request=https.request(search_endpoint, options, (search_stream) => { // Send request.
		collect_json(search_stream, (status, data) => { // Read and parse search response.
			if (status !== 200 || !data){ // Validate success and response body.
				return send_text(res, 502, "Spotify search failed."); // Send failure response.
			}
			fs.writeFile(cache_path, JSON.stringify(data, null, 2), () => {}); // Cache the raw JSON.
			handle_spotify_results(artist, data, res); // Render results from live data.
		});
	});
	search_request.on("error", () => send_text(res, 502, "Spotify search failed.")); // Network error.
	search_request.end(); // Finalize the GET request (no body).
}

// Collect JSON from an HTTP response stream and pass it to a callback.
function collect_json(stream, callback){ // General helper for Spotify responses.
	let body = ""; // Buffer for assembling the full response body.
	stream.on("data", (chunk) => { // Handle streamed data chunks.
		body += chunk; // Append each chunk to the body string.
	});
	stream.on("end", () => { // When the response has fully arrived.
		let data = null; // Default parsed data to null (failure state).
		try{ // Try to parse JSON from the body.
			data = JSON.parse(body); // Convert JSON text into an object.
		}catch (err){ // If parsing fails, keep data as null.
			data = null; // Explicitly keep null to signal parse error.
		}
		callback(stream.statusCode, data); // Return HTTP status + parsed data.
	});
}

// Normalize Spotify results, cache album art, then render HTML.
function handle_spotify_results(artist, data, res){ // Central handler after Spotify data exists.
	const albums = data && data.albums && Array.isArray(data.albums.items) ? data.albums.items : []; // Normalize list.
	cache_album_art(albums, () => { // Ensure album art is cached locally.
		render_results_page(artist, albums, res); // Render the HTML page to the user.
	});
}

// Download album art files to disk and expose local URLs.
function cache_album_art(albums, callback){ // Downloads album images to /album-art.
	let pending = 0; // Track the number of outstanding downloads.
	albums.forEach((album) => { // Process each album from Spotify.
		const image = album.images && album.images[0]; // Use the largest image (index 0).
		if (!image || !image.url){ // If no image exists for this album.
			album.local_image = ""; // Mark as missing so we render a placeholder.
			return; // Skip download for this album.
		}
		const file_name = `${album.id}.jpg`; // Use album ID for unique, stable filenames.
		const file_path = path.join(ALBUM_ART_DIR, file_name); // Full path to local image file.
		album.local_image = `/album-art/${file_name}`; // URL used in the rendered HTML.
		if (fs.existsSync(file_path)){ // If image already exists on disk.
			return; // Skip download to save time/bandwidth.
		}
		pending += 1; // Increment outstanding downloads count.
		const file = fs.createWriteStream(file_path); // Open a write stream to save the image.
		let finished = false; // Guard to ensure we only finish once.
		function done(){ // Helper to finish a download and maybe call callback.
			if (finished){ // Avoid double-calling for a single image.
				return; // Exit early if already finished.
			}
			finished = true; // Mark this download as finished.
			pending -= 1; // Decrement the global pending counter.
			if (pending === 0){ // If this was the last download.
				callback(); // Notify that caching is done.
			}
		}
		file.on("error", done); // If the file stream errors, treat as finished.
		https.get(image.url, (image_stream) => { // Download the image from Spotify.
			if (image_stream.statusCode !== 200){ // If the image response is not OK.
				file.close(done); // Close the file and mark finished.
				return; // Stop processing this image.
			}
			image_stream.pipe(file); // Pipe the image bytes into the local file.
			file.on("finish", () => file.close(done)); // Close the file when write finishes.
			image_stream.on("error", done); // If download stream errors, finish.
		}).on("error", done); // If the HTTPS request fails, finish.
	});
	if (pending === 0){ // If there were no downloads to wait for.
		process.nextTick(callback); // Call callback asynchronously to keep behavior consistent.
	}
}

// Render the results HTML page with album art and links.
function render_results_page(artist, albums, res){ // Creates the HTML response.
	const safe_artist = escape_html(artist); // Escape user input to prevent HTML injection.
	res.writeHead(200, {"Content-Type": "text/html"}); // Send HTML status/headers.
	// Begin HTML template string; lines below are literal HTML output (not JS).
	res.write(`<!DOCTYPE html>
<html>
	<head>
		<title>Album Art Results</title>
		<style>
			body{
				margin: 0 auto;
				max-width: 1000px;
				font-family: Arial, sans-serif;
				overflow-x:hidden;
			}
			header{
				margin: 20px 0;
			}
			form{
				display: flex;
				gap: 12px;
				align-items: center;
				margin-bottom: 20px;
			}
			form input[type="text"]{
				flex: 1;
				padding: 6px 8px;
			}
			.grid{
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
				gap: 16px;
			}
			figure{
				margin: 0;
			}
			figure img{
				width: 100%;
				height: auto;
				display: block;
			}
			figcaption{
				margin-top: 6px;
				font-size: 14px;
			}
			.placeholder{
				background: #efefef;
				color: #666;
				height: 160px;
				display: flex;
				align-items: center;
				justify-content: center;
				text-align: center;
				padding: 10px;
				box-sizing: border-box;
			}
		</style>
	</head>
	<body>
		<header>
			<a href="/"><img src="/images/banner.jpg" alt="Album Art Search" /></a>
		</header>
		<form action="/search" method="get">
			<label for="artist">Artist Name:</label>
			<input id="artist" name="artist" type="text" value="${safe_artist}" />
			<input type="submit" value="Search" />
		</form>
		<h2>Results for "${safe_artist}"</h2>
		<div class="grid">
`);
	if (albums.length === 0){ // If there are no albums to show.
		res.write(`<p>No albums found.</p>`); // Output a friendly empty-state message.
	}else{ // Otherwise render each album card.
		albums.forEach((album) => { // Loop through the album list.
			const album_name = escape_html(album.name || "Untitled"); // Safe album title for HTML.
			const album_link = album.external_urls && album.external_urls.spotify ? album.external_urls.spotify : ""; // Spotify URL.
			const image_src = album.local_image || ""; // Local image URL (or empty string).
			const image_tag = image_src // Use image tag if we have a local URL.
				? `<img src="${image_src}" alt="${album_name}" />` // HTML for album image.
				: `<div class="placeholder">No album art</div>`; // Fallback HTML when image missing.
			// Build the <figure> body once, then wrap with a link if available.
			const figure_content = `
				${image_tag}
				<figcaption>${album_name}</figcaption>
			`;
			if (album_link){ // If there is a Spotify URL for the album.
				res.write(`<figure><a href="${album_link}" target="_blank" rel="noopener">${figure_content}</a></figure>`); // Linked card.
			}else{ // Otherwise render without a link.
				res.write(`<figure>${figure_content}</figure>`); // Non-linked card.
			}
		});
	}
	// Finish HTML template string; lines below are literal HTML output (not JS).
	res.end(`
		</div>
	</body>
</html>`);
}

// Escape text so it is safe to interpolate into HTML.
function escape_html(value){ // Prevent XSS by escaping special characters.
	return String(value).replace(/[&<>"']/g, (char) => { // Replace only unsafe HTML chars.
		switch (char){ // Map each character to its entity.
			case "&": return "&amp;"; // Escape ampersand.
			case "<": return "&lt;"; // Escape less-than.
			case ">": return "&gt;"; // Escape greater-than.
			case "\"": return "&quot;"; // Escape double quote.
			case "'": return "&#39;"; // Escape single quote.
			default: return char; // Pass through any other character.
		}
	});
}

// Convert a string to a safe filename for caching.
function safe_filename(value){ // Ensure cache filenames are filesystem-safe.
	return value.toLowerCase() // Normalize to lowercase for consistency.
		.replace(/[^a-z0-9]+/g, "_") // Replace non-alphanumerics with underscores.
		.replace(/^_+|_+$/g, "") || "search"; // Trim underscores; fall back to "search".
}

server.on("listening", listening_handler); // Register a callback for the "listening" event.
// Log when the server is ready.
function listening_handler(){ // Runs once the server starts listening.
	console.log(`Now Listening on Port ${port}`); // Log a readiness message.
}

server.listen(port); // Start accepting connections on the configured port.
