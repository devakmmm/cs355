/*
=-=-=-=-=-=-=-=-=-=-=-=-
Album Art Search
=-=-=-=-=-=-=-=-=-=-=-=-
Student ID:
Comment (Required):

=-=-=-=-=-=-=-=-=-=-=-=-
*/
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const querystring = require('querystring');
const port = 3000;
const server = http.createServer();
const {client_id, client_secret} = require('./credentials.js');

// Local folders for cached JSON and album art images.
const ALBUM_ART_DIR = path.join(__dirname, "album-art");
const CACHE_DIR = path.join(__dirname, "cache");

ensure_directory(ALBUM_ART_DIR);
ensure_directory(CACHE_DIR);

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
server.on("request", connection_handler);
// Main router for incoming HTTP requests.
function connection_handler(req, res){
	console.log(`New Request for ${req.url} from ${req.socket.remoteAddress}`);
	if (req.url=="/" || req.url=="/index.html"){
		return stream_file(res, path.join(__dirname, "html", "main.html"), "text/html");
	}
	else if (req.url=="/favicon.ico"){
		return stream_file(res, path.join(__dirname, "images", "favicon.ico"), "image/x-icon");
	}
	else if (req.url=="/images/banner.jpg") {
		return stream_file(res, path.join(__dirname, "images", "banner.jpg"), "image/jpeg");
	}
	else if (req.url.startsWith("/album-art/")){
		return serve_album_art(req, res);
	}
	else if (req.url.startsWith("/search")){
		return handle_search(req, res);
	}
	return send_text(res, 404, "404 Not Found");
}

// Create a directory (and parents) if it does not exist.
function ensure_directory(dir){
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir, {recursive: true});
	}
}

// Stream a file to the response with a fixed Content-Type.
function stream_file(res, file_path, content_type){
	const stream=fs.createReadStream(file_path);
	stream.on("ready", () => {
		res.writeHead(200, {"Content-Type": content_type});
		stream.pipe(res);
	});
	stream.on("error", () => send_text(res, 404, "404 File Not Found"));
}

// Send a plain-text response, respecting headers already sent.
function send_text(res, status, message){
	if (res.headersSent){
		return res.end();
	}
	res.writeHead(status, {"Content-Type": "text/plain"});
	res.end(message);
}

// Serve cached album art files from disk.
function serve_album_art(req, res){
	const url = new URL(req.url, `http://${req.headers.host}`);
	const filename = path.basename(url.pathname);
	if (!filename || filename==="album-art"){
		return send_text(res, 404, "404 Image Not Found");
	}
	const file_path = path.join(ALBUM_ART_DIR, filename);
	return stream_file(res, file_path, "image/jpeg");
}

// Handle /search requests: validate input, hit cache, or fetch from Spotify.
function handle_search(req, res){
	const url = new URL(req.url, `http://${req.headers.host}`);
	const artist = (url.searchParams.get("artist") || "").trim();
	if (!artist){
		return send_text(res, 400, "Missing artist name.");
	}
	if (!client_id || !client_secret){
		return send_text(res, 500, "Missing Spotify credentials.");
	}
	const cache_path = path.join(CACHE_DIR, `${safe_filename(artist)}.json`);
	fs.readFile(cache_path, "utf8", (err, data) => {
		if (!err){
			try{
				const cached = JSON.parse(data);
				return handle_spotify_results(artist, cached, res);
			}catch (parse_err){
				// Fall through to re-fetch when cache is invalid.
			}
		}else if (err.code !== "ENOENT"){
			return send_text(res, 500, "Cache read error.");
		}
		request_access_token(artist, res, cache_path);
	});
}

// Request a Spotify API access token using client credentials.
function request_access_token(artist, res, cache_path){
	const base64data = Buffer.from(`${client_id}:${client_secret}`).toString("base64"); 
	const post_data = querystring.stringify({grant_type: "client_credentials"});
	const options = {
		method: "POST",
		headers:{
			"Authorization": `Basic ${base64data}`,
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": Buffer.byteLength(post_data)
		}
	};

	const token_endpoint = "https://accounts.spotify.com/api/token";
	const token_request=https.request(token_endpoint, options, (token_stream) => {
		collect_json(token_stream, (status, data) => {
			if (status !== 200 || !data || !data.access_token){
				return send_text(res, 502, "Spotify token request failed.");
			}
			search_spotify(artist, data.access_token, res, cache_path);
		});
	});
	token_request.on("error", () => send_text(res, 502, "Spotify token request failed."));
	token_request.end(post_data); //same as token_request.end(post_data);
}

// Search Spotify for albums and cache the response.
function search_spotify(artist, access_token, res, cache_path){
	const query = querystring.stringify({q: artist, type: "album", limit: 12});
	const options = {
		headers: {
			"Authorization": `Bearer ${access_token}`
		}
	};
	const search_endpoint = `https://api.spotify.com/v1/search?${query}`;
	const search_request=https.request(search_endpoint, options, (search_stream) => {
		collect_json(search_stream, (status, data) => {
			if (status !== 200 || !data){
				return send_text(res, 502, "Spotify search failed.");
			}
			fs.writeFile(cache_path, JSON.stringify(data, null, 2), () => {});
			handle_spotify_results(artist, data, res);
		});
	});
	search_request.on("error", () => send_text(res, 502, "Spotify search failed."));
	search_request.end();
}

// Collect JSON from an HTTP response stream and pass it to a callback.
function collect_json(stream, callback){
	let body = "";
	stream.on("data", (chunk) => {
		body += chunk;
	});
	stream.on("end", () => {
		let data = null;
		try{
			data = JSON.parse(body);
		}catch (err){
			data = null;
		}
		callback(stream.statusCode, data);
	});
}

// Normalize Spotify results, cache album art, then render HTML.
function handle_spotify_results(artist, data, res){
	const albums = data && data.albums && Array.isArray(data.albums.items) ? data.albums.items : [];
	cache_album_art(albums, () => {
		render_results_page(artist, albums, res);
	});
}

// Download album art files to disk and expose local URLs.
function cache_album_art(albums, callback){
	let pending = 0;
	albums.forEach((album) => {
		const image = album.images && album.images[0];
		if (!image || !image.url){
			album.local_image = "";
			return;
		}
		const file_name = `${album.id}.jpg`;
		const file_path = path.join(ALBUM_ART_DIR, file_name);
		album.local_image = `/album-art/${file_name}`;
		if (fs.existsSync(file_path)){
			return;
		}
		pending += 1;
		const file = fs.createWriteStream(file_path);
		let finished = false;
		function done(){
			if (finished){
				return;
			}
			finished = true;
			pending -= 1;
			if (pending === 0){
				callback();
			}
		}
		file.on("error", done);
		https.get(image.url, (image_stream) => {
			if (image_stream.statusCode !== 200){
				file.close(done);
				return;
			}
			image_stream.pipe(file);
			file.on("finish", () => file.close(done));
			image_stream.on("error", done);
		}).on("error", done);
	});
	if (pending === 0){
		process.nextTick(callback);
	}
}

// Render the results HTML page with album art and links.
function render_results_page(artist, albums, res){
	const safe_artist = escape_html(artist);
	res.writeHead(200, {"Content-Type": "text/html"});
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
	if (albums.length === 0){
		res.write(`<p>No albums found.</p>`);
	}else{
		albums.forEach((album) => {
			const album_name = escape_html(album.name || "Untitled");
			const album_link = album.external_urls && album.external_urls.spotify ? album.external_urls.spotify : "";
			const image_src = album.local_image || "";
			const image_tag = image_src
				? `<img src="${image_src}" alt="${album_name}" />`
				: `<div class="placeholder">No album art</div>`;
			const figure_content = `
				${image_tag}
				<figcaption>${album_name}</figcaption>
			`;
			if (album_link){
				res.write(`<figure><a href="${album_link}" target="_blank" rel="noopener">${figure_content}</a></figure>`);
			}else{
				res.write(`<figure>${figure_content}</figure>`);
			}
		});
	}
	res.end(`
		</div>
	</body>
</html>`);
}

// Escape text so it is safe to interpolate into HTML.
function escape_html(value){
	return String(value).replace(/[&<>"']/g, (char) => {
		switch (char){
			case "&": return "&amp;";
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "\"": return "&quot;";
			case "'": return "&#39;";
			default: return char;
		}
	});
}

// Convert a string to a safe filename for caching.
function safe_filename(value){
	return value.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "") || "search";
}

server.on("listening", listening_handler);
// Log when the server is ready.
function listening_handler(){
	console.log(`Now Listening on Port ${port}`);
}

server.listen(port);
